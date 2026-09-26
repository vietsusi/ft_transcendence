// Run after npm run build. Uses real HTTP + AI SDK SSE encoding, no external model.
const { test: nodeTest } = require('node:test');
const test = (name, fn) => nodeTest(name, { timeout: 5000 }, fn);
const assert = require('node:assert/strict');
const express = require('express');
const { ChatController } = require('../dist/src/chat/chat.controller');
const { ChatService } = require('../dist/src/chat/chat.service');
const { ChatFailure } = require('../dist/src/chat/chat.generation');

async function fixture(reply, timeoutMs = 90000) {
  const lifecycle = { active: false, signal: null };
  const chat = {
    validate: (body) => new ChatService({}, {}).validate(body),
    status: () => ({ configured: true }),
    acquire: () => {
      assert.equal(lifecycle.active, false);
      lifecycle.active = true;
      return () => {
        lifecycle.active = false;
      };
    },
    reply: (...args) => {
      lifecycle.signal = args[2];
      return reply(...args);
    },
  };
  const controller = new ChatController(chat);
  controller.timeoutMs = timeoutMs;
  const app = express();
  app.use(express.json());
  app.post('/chat', (req, res, next) => {
    req.user = { id: 1 };
    controller.send(req.body, req, res).catch(next);
  });
  app.use((err, req, res, next) => {
    res.status(err.getStatus?.() || 500).json({ message: err.message });
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const url = `http://127.0.0.1:${server.address().port}/chat`;
  const request = (
    body = {
      messages: [{ role: 'user', parts: [{ type: 'text', text: 'Hello' }] }],
    },
    signal,
  ) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: signal || AbortSignal.timeout(3000),
    });
  return {
    request,
    lifecycle,
    close: () =>
      new Promise((r) => {
        server.close(r);
        server.closeAllConnections();
      }),
  };
}
const success = {
  mode: 'live',
  text: '',
  movies: [{ id: 7, title: 'Catalog film', href: '/movies/7' }],
};
function events(text) {
  return text
    .split('\n')
    .filter((s) => s.startsWith('data: ') && !s.includes('[DONE]'))
    .map((s) => JSON.parse(s.slice(6)));
}
const tick = () => new Promise((r) => setTimeout(r, 10));

test('SSE sends a verified paragraph before generation finishes, then cards and finish', async () => {
  let release;
  const gate = new Promise((r) => {
    release = r;
  });
  const f = await fixture(async (_b, _u, _s, emit, progress) => {
    progress('Generating and checking the answer');
    emit('First paragraph.');
    await gate;
    emit('\n\nSecond paragraph.');
    return success;
  });
  try {
    const response = await f.request();
    assert.equal(response.headers.get('x-vercel-ai-ui-message-stream'), 'v1');
    assert.equal(response.headers.get('x-accel-buffering'), 'no');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let data = '';
    while (!data.includes('First paragraph.'))
      data += decoder.decode((await reader.read()).value);
    assert.equal(f.lifecycle.active, true);
    assert.ok(!data.includes('Second paragraph.'));
    release();
    while (true) {
      const n = await reader.read();
      if (n.done) break;
      data += decoder.decode(n.value);
    }
    assert.equal(events(data).filter((e) => e.type === 'text-delta').length, 2);
    assert.equal(
      events(data).find((e) => e.type === 'data-catalog').data.movies[0].href,
      '/movies/7',
    );
    assert.equal(events(data).at(-1).finishReason, 'stop');
    assert.ok(data.includes('[DONE]'));
    assert.equal(f.lifecycle.active, false);
  } finally {
    release();
    await f.close();
  }
});
test('invalid request fails before SSE and before acquiring a slot', async () => {
  const f = await fixture(() => {
    throw new Error('must not call');
  });
  try {
    const r = await f.request({ messages: [] });
    assert.equal(r.status, 400);
    assert.equal(f.lifecycle.active, false);
  } finally {
    await f.close();
  }
});
test('disconnect aborts model work and releases concurrency slot', async () => {
  const f = await fixture((_b, _u, signal, _emit, progress) => {
    progress('Pending');
    return new Promise((_, reject) =>
      signal.addEventListener('abort', () => reject(signal.reason), {
        once: true,
      }),
    );
  });
  try {
    const abort = new AbortController();
    const r = await f.request(undefined, abort.signal);
    await r.body.getReader().read();
    abort.abort();
    for (let i = 0; i < 50 && f.lifecycle.active; i++) await tick();
    assert.equal(f.lifecycle.signal.aborted, true);
    assert.equal(f.lifecycle.active, false);
  } finally {
    await f.close();
  }
});
test('whole-request timeout terminates even an uncooperative model promise', async () => {
  const f = await fixture(() => new Promise(() => {}), 40);
  try {
    const data = events(await (await f.request()).text());
    assert.match(data.find((e) => e.type === 'error').errorText, /^TIMEOUT/);
    assert.equal(data.at(-1).finishReason, 'error');
    assert.equal(f.lifecycle.signal.aborted, true);
    assert.equal(f.lifecycle.active, false);
  } finally {
    await f.close();
  }
});
for (const [name, error, code] of [
  [
    'content rejection',
    new ChatFailure('CONTENT_REJECTED'),
    'CONTENT_REJECTED',
  ],
  [
    'provider rate limit',
    { statusCode: 429, message: 'secret diagnostics' },
    'PROVIDER_RATE_LIMIT',
  ],
  ['provider error', new Error('secret diagnostics'), 'PROVIDER_ERROR'],
])
  test(`${name} preserves approved prefix, exposes no cards or provider diagnostics`, async () => {
    const f = await fixture(async (_b, _u, _s, emit) => {
      emit('Approved prefix.');
      throw error;
    });
    try {
      const raw = await (await f.request()).text();
      const data = events(raw);
      assert.equal(data.filter((e) => e.type === 'text-delta').length, 1);
      assert.ok(
        data.find((e) => e.type === 'error').errorText.startsWith(code),
      );
      assert.equal(
        data.some((e) => e.type === 'data-catalog'),
        false,
      );
      assert.ok(!raw.includes('secret diagnostics'));
      assert.equal(f.lifecycle.active, false);
    } finally {
      await f.close();
    }
  });

const { ChatGeneration } = require('../dist/src/chat/chat.generation');
async function modelFixture(handle) {
  const app = express();
  app.use(express.json());
  app.post('/chat/completions', handle);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const previous = { ...process.env };
  Object.assign(process.env, {
    CHAT_BASE_URL: `http://127.0.0.1:${server.address().port}`,
    CHAT_API_KEY: 'test',
    CHAT_MODEL: 'test',
  });
  return async () => {
    process.env = previous;
    await new Promise((r) => {
      server.close(r);
      server.closeAllConnections();
    });
  };
}
const modelContext = {
  intent: { language: 'en', intent: 'help' },
  movies: [],
  question: 'Help',
};
function chunk(res, content, finish_reason = null) {
  res.write(
    `data: ${JSON.stringify({ id: 'test', object: 'chat.completion.chunk', created: 1, model: 'test', choices: [{ index: 0, delta: { content }, finish_reason }] })}\n\n`,
  );
}
test('actual SDK adapter buffers incomplete JSON elements before exposing paragraphs', async () => {
  let release;
  const gate = new Promise((r) => {
    release = r;
  });
  const close = await modelFixture(async (req, res) => {
    assert.equal(req.body.stream, true);
    res.setHeader('Content-Type', 'text/event-stream');
    chunk(
      res,
      '{"elements":[{"text":"First safe paragraph.","movieIds":[]},{"text":"Second',
    );
    await gate;
    chunk(res, ' safe paragraph.","movieIds":[]}]}');
    chunk(res, '', 'stop');
    res.end('data: [DONE]\n\n');
  });
  const abort = new AbortController();
  try {
    const iterator = new ChatGeneration().paragraphs(
      modelContext,
      AbortSignal.any([abort.signal, AbortSignal.timeout(2000)]),
    );
    const first = await iterator.next();
    assert.equal(first.value.text, 'First safe paragraph.');
    release();
    const second = await iterator.next();
    assert.equal(second.value.text, 'Second safe paragraph.');
    assert.equal((await iterator.next()).done, true);
  } finally {
    release();
    abort.abort();
    await close();
  }
});
test('actual SDK adapter preserves upstream 429 for safe error classification', async () => {
  const close = await modelFixture((req, res) =>
    res.status(429).json({ error: { message: 'private upstream message' } }),
  );
  try {
    await assert.rejects(
      async () => {
        for await (const p of new ChatGeneration().paragraphs(
          modelContext,
          new AbortController().signal,
        ))
          assert.fail('no paragraph expected');
      },
      (error) => error.statusCode === 429,
    );
  } finally {
    await close();
  }
});
test('actual SDK adapter rejects truncated structured generation', async () => {
  const close = await modelFixture((req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    chunk(res, '{"elements":[{"text":"incomplete');
    chunk(res, '', 'length');
    res.end('data: [DONE]\n\n');
  });
  try {
    await assert.rejects(async () => {
      for await (const p of new ChatGeneration().paragraphs(
        modelContext,
        new AbortController().signal,
      ))
        assert.fail('incomplete text leaked');
    });
  } finally {
    await close();
  }
});

for (const [name, verdict, expected] of [
  [
    'clean paragraph',
    { safe: true, literalMovieMentions: [], unsupportedClaims: false },
    true,
  ],
  [
    'contradictory safe flag with literal title',
    {
      safe: true,
      literalMovieMentions: ['Outside film'],
      unsupportedClaims: false,
    },
    false,
  ],
  [
    'unsupported facts',
    { safe: true, literalMovieMentions: [], unsupportedClaims: true },
    false,
  ],
])
  test(`actual verifier schema: ${name}`, async () => {
    const close = await modelFixture((req, res) =>
      res.json({
        id: 'verify',
        object: 'chat.completion',
        created: 1,
        model: 'test',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: JSON.stringify(verdict) },
            finish_reason: 'stop',
          },
        ],
      }),
    );
    try {
      assert.equal(
        await new ChatGeneration().verify(
          { text: 'Ask about a genre.', movieIds: [] },
          modelContext,
          new AbortController().signal,
        ),
        expected,
      );
    } finally {
      await close();
    }
  });
