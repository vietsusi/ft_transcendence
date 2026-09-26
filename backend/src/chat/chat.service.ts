import {
  Injectable,
  ServiceUnavailableException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { demoIntent, intentSchema, selectMovies } from './chat.logic';
import type { ChatIntent } from './chat.logic';
import { z } from 'zod';
import {
  ChatGeneration,
  ChatFailure,
  abortable,
  validateParagraph,
  renderParagraph,
} from './chat.generation';

const requestSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum(['user', 'assistant']),
            parts: z
              .array(
                z
                  .object({
                    type: z.string(),
                    text: z.string().max(4000).optional(),
                  })
                  .passthrough(),
              )
              .max(20),
          })
          .passthrough(),
      )
      .min(1)
      .max(24),
  })
  .passthrough();

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly generation: ChatGeneration,
  ) {}

  private readonly usage = new Map<
    number,
    { started: number; count: number; active: boolean }
  >();

  acquire(userId: number) {
    const now = Date.now();
    for (const [id, entry] of this.usage) {
      if (!entry.active && now - entry.started >= 60000) this.usage.delete(id);
    }
    const entry = this.usage.get(userId) || {
      started: now,
      count: 0,
      active: false,
    };
    if (entry.active || entry.count >= 10)
      throw new HttpException(
        'CHAT_RATE_LIMIT: Wait before sending another question.',
        429,
      );
    entry.count++;
    entry.active = true;
    this.usage.set(userId, entry);
    return () => {
      entry.active = false;
    };
  }

  validate(body: unknown) {
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException(
        'Send 1–24 messages, at most 4000 characters per text part.',
      );
    const texts = parsed.data.messages.map((m) =>
      m.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text || '')
        .join('\n'),
    );
    if (texts.reduce((n, s) => n + s.length, 0) > 24000)
      throw new BadRequestException('Conversation too long. Start a new chat.');
    if (parsed.data.messages.at(-1)?.role !== 'user' || !texts.at(-1)?.trim())
      throw new BadRequestException('A user question is required.');
    return parsed.data;
  }

  status() {
    const mode = process.env.CHAT_MODE === 'demo' ? 'demo' : 'live';
    return {
      mode,
      configured:
        mode === 'demo' ||
        !!(
          process.env.CHAT_BASE_URL &&
          process.env.CHAT_API_KEY &&
          process.env.CHAT_MODEL
        ),
    };
  }

  async reply(
    body: unknown,
    userId: number,
    abortSignal: AbortSignal,
    emit: (text: string) => void = () => {},
    progress: (stage: string) => void = () => {},
  ) {
    const parsed = { data: this.validate(body) };
    abortSignal.throwIfAborted();
    progress('Searching the catalog');
    const messages = parsed.data.messages.map((m) => ({
      role: m.role,
      content: m.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text || '')
        .join('\n'),
    }));
    if (messages.reduce((n, m) => n + m.content.length, 0) > 24000)
      throw new BadRequestException('Conversation too long. Start a new chat.');
    const last = messages.at(-1);
    if (!last || last.role !== 'user' || !last.content.trim())
      throw new BadRequestException('A user question is required.');
    const [catalog, user] = await abortable(
      Promise.all([
        this.prisma.movie.findMany({
          include: { genres: true },
          orderBy: { id: 'asc' },
          take: 500,
        }),
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { preferredGenres: true },
        }),
      ]),
      abortSignal,
    );
    // Rehydrate card references from current DB rows, not client-supplied titles.
    parsed.data.messages.forEach((m, index) => {
      if (m.role !== 'assistant') return;
      const cardIds = m.parts
        .filter((p) => p.type === 'data-catalog')
        .flatMap((p) => {
          const data = z
            .object({
              movies: z.array(z.object({ id: z.number().int() })).max(6),
            })
            .safeParse(p.data);
          return data.success ? data.data.movies.map((movie) => movie.id) : [];
        });
      const cards = cardIds
        .map((id) => catalog.find((movie) => movie.id === id))
        .filter((movie) => movie !== undefined);
      if (cards.length)
        messages[index].content +=
          '\nCatalog cards in displayed order: ' +
          JSON.stringify(cards.map((m) => ({ id: m.id, title: m.title })));
    });
    const status = this.status();
    if (!status.configured)
      throw new ServiceUnavailableException(
        'Set CHAT_BASE_URL, CHAT_API_KEY and CHAT_MODEL in the root .env, then recreate backend.',
      );
    let intent: ChatIntent;
    if (status.mode === 'demo') intent = demoIntent(last.content, catalog);
    else {
      intent = intentSchema.parse(
        await this.generation.extract(messages, catalog, abortSignal),
      );
    }
    const nonCatalog = ['greeting', 'help', 'offtopic', 'clarify'].includes(
      intent.intent,
    );
    const selected = nonCatalog
      ? []
      : selectMovies(catalog, intent, user?.preferredGenres || []);
    if (status.mode === 'live') {
      // Pass only bounded, stored facts; never expose provider strings as cards/links.
      const quotedTitles = [
        ...last.content.matchAll(/[《“"]([^》”"\n]{2,120})[》”"]/g),
      ].map((match) => match[1]);
      const forbiddenTitles = [
        ...catalog.map((m) => m.title),
        intent.search,
        ...quotedTitles,
      ].filter(Boolean);
      // The missing title is needed for DB selection, never for answer generation.
      const noResults = !nonCatalog && !selected.length;
      const context = {
        intent: noResults ? { ...intent, search: '' } : intent,
        movies: selected,
        question: noResults
          ? 'No catalog entries matched the requested title or filters. Explain the limitation without naming or substituting films.'
          : last.content,
        forbiddenTitles,
      };
      const generationAbort = new AbortController();
      const signal = AbortSignal.any([abortSignal, generationAbort.signal]);
      let text = '',
        count = 0;
      try {
        progress('Generating and checking the answer');
        for await (const value of this.generation.paragraphs(context, signal)) {
          signal.throwIfAborted();
          if (++count > 6) throw new ChatFailure('CONTENT_REJECTED');
          const paragraph = validateParagraph(value, context);
          if (
            !(await abortable(
              this.generation.verify(paragraph, context, signal),
              signal,
            ))
          )
            throw new ChatFailure('CONTENT_REJECTED');
          signal.throwIfAborted();
          const rendered =
            (text ? '\n\n' : '') + renderParagraph(paragraph, context);
          emit(rendered);
          text += rendered;
        }
        if (!count) throw new ChatFailure('PROVIDER_ERROR');
        return {
          text,
          movies: selected.map((m) => ({ ...m, href: `/movies/${m.id}` })),
          mode: status.mode,
        };
      } finally {
        generationAbort.abort();
      }
    }
    const zh = intent.language === 'zh';
    const fixed = {
      greeting: zh
        ? '你好！告诉我喜欢的类型，或问我库内某部电影。'
        : 'Hello! Tell me a genre you enjoy, or ask about a film in our catalog.',
      help: zh
        ? '我能查询库内电影、按类型和年份推荐，并寻找相似作品。点击结果卡片可打开详情。评分可能是标注过的演示分；暂不提供播放资源、实时资讯或完整剧情。'
        : 'I can search our catalog, recommend by genre/year, and find similar titles. Open a card for details. Some scores are labeled demo values. Playback, live news and full plots are unavailable.',
      offtopic: zh
        ? '我目前专注本站影视目录。可以告诉我想看的类型、年份，或片名。'
        : 'I focus on this site’s film catalog. Ask about a title, genre or release year.',
      clarify: zh
        ? '目前支持片名、类型、年份和相似作品查询。请补充这些条件；片长、观看平台、获奖情况等不在现有数据中。'
        : 'Please use a title, genre, year or similar-title request. Runtime, streaming availability and awards are not in this dataset.',
    };
    if (intent.intent in fixed)
      return {
        text: fixed[intent.intent as keyof typeof fixed],
        movies: [],
        mode: status.mode,
      };
    const movies = selectMovies(catalog, intent, user?.preferredGenres || []);
    const text = !movies.length
      ? zh
        ? '库内没有符合这些条件的作品。我不会补充库外电影；可以换个片名或放宽条件。'
        : 'No catalog entries match these constraints. I won’t invent outside titles. Try another title or broaden the filters.'
      : zh
        ? `找到 ${movies.length} 部库内作品。结果综合类型匹配、已保存偏好和目录评分排序。详情仅包含数据库已记录的信息。`
        : `Found ${movies.length} catalog entries, ranked by genre overlap, saved preferences and catalog score. Details contain only stored information.`;
    return {
      text,
      movies: movies.map((m) => ({ ...m, href: `/movies/${m.id}` })),
      mode: status.mode,
    };
  }
}
