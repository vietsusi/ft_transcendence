# Catalog LLM assistant

Authenticated `POST /api/chat` accepts AI SDK UI messages and responds with the AI SDK v1 UI-message SSE protocol. `GET /api/chat/status` reports mode/configuration readiness without exposing credentials. This module implements a generated, paragraph-streamed catalog assistant; it does not claim RAG or machine-learning recommendation credit.

## Generation and release boundary

1. Validate the request before starting SSE: 1–24 messages, at most 4,000 characters per text part, 24,000 text characters total, ending with a nonempty user message.
2. Load the current database catalog (at most 500 rows) and saved genre preferences. Rehydrate previous card IDs from these rows; ignore client card titles/links.
3. `generateText` + `Output.object` extracts validated search intent. The server selects at most six movies using the existing deterministic filters/ranking.
4. `streamText` + `Output.array` generates short narrative paragraphs with explicit `movieIds`. Movie mentions must be `{{movie:ID}}` placeholders. `elementStream` yields complete JSON elements; partial JSON/raw model tokens never go to the browser.
5. Before releasing **each** paragraph, check schema/length, placeholder/ID equality, selected-ID membership, forbidden literal titles, and markup/URL syntax. A separate structured model call then checks literal movie mentions, factual support and intent compliance. An ambiguous, rejected or failed verification withholds the paragraph and stops the answer. There is no unchecked fallback.
6. Only after both checks pass, replace ID placeholders with database titles and emit one `text-delta` for that paragraph. Generate cards and `/movies/:id` links from server-owned rows after successful completion. The frontend renders text as plain text, never model-authored Markdown links or HTML.

The answer is genuinely model-authored prose, released paragraph by paragraph. It is deliberately not raw token streaming or a fully buffered answer animated afterward. An early verified paragraph can arrive while later generation/verification is pending. Initial latency includes intent extraction and the first verification call. At most six paragraphs of 800 characters are accepted, with bounded model output and no automatic provider retries.

### Grounding limits and refusal

Deterministic checks establish membership and consistency of referenced IDs. Known catalog names, extracted search names and quoted user names are forbidden in generated prose; the server is the only source of displayed film names. English names are matched on word boundaries; Chinese names are also checked after whitespace/punctuation/width normalization. Missing-title queries are redacted before answer generation, preventing the common “no record for [outside title]” echo. A regression test covers that exact live-discovered failure.

**Free-text semantic safety is not a formal guarantee.** The independent verifier can still miss a novel/obfuscated outside title or unsupported claim that deterministic checks cannot recognize; it uses the same configured model in a separate call, so errors can be correlated. Prompt instructions alone are not the safety boundary, but the semantic verifier is still probabilistic. Do not advertise this as mathematically preventing every possible outside-title string. Requiring that stronger invariant would require restricting displayed language to a closed grammar/templates, reducing open-ended generation. Keep adversarial tests and review this tradeoff during module acceptance.

Catalog descriptions are database facts, not externally verified truth. Snapshot rows can also be edited/deleted after a response. The 500-row catalog cap and rule ranking are unchanged. Ranking remains 4 × requested/reference genre overlaps + 2 × preference overlaps + catalog score / 10, ties by ID. Mock scores remain explicitly labeled; no learned user model exists.

## Supported responses

- Catalog queries: explain matches using stored genres, years and descriptions; no invented plot/cast/availability.
- No results: explain absence without echoing the missing title or substituting other films; suggest broader supported filters.
- Greeting/help: generated guidance for title, genre, year, similar-film searches and card navigation.
- Unsupported constraints: request supported criteria and explain missing data.
- Unrelated questions: redirect to the film catalog.

## Cancellation, errors and limits

- The entire request (database, intent, generation and verification) has a **90-second deadline**. The same abort signal reaches every model call; a promise race bounds adapters/DB operations that ignore cancellation. Underlying DB work may still complete, but cannot emit after cancellation.
- Stop/disconnect aborts in-flight work, drops pending output and releases the per-user slot. The frontend marks a stopped answer as partial and allows another question. Histories remain page-local.
- HTTP 400/401/429/503 handle pre-stream validation/authentication/limits/configuration. Once SSE begins, errors use safe `error` events: `TIMEOUT`, `CONTENT_REJECTED`, `PROVIDER_RATE_LIMIT`, `PROVIDER_ERROR`. A failed stream ends with `finishReason: error`; approved prior paragraphs remain visibly partial, and no result cards are issued. Provider diagnostics/keys are not returned.
- Chat POST is limited to **10 requests/minute per IP**, plus **10 requests/minute per authenticated user** and **one active request/user**. These counters are process-local, suitable for this single-backend deployment; shared storage is needed before horizontal scaling. The existing global limiter still applies elsewhere.
- SSE disables proxy buffering via `X-Accel-Buffering: no`; the response pump waits on backpressure and also unblocks on disconnect. Reverse proxies must support SSE and a timeout longer than the request deadline.

## Configuration

Root `.env`: `CHAT_MODE=live`, `CHAT_BASE_URL`, `CHAT_API_KEY`, `CHAT_MODEL`. The existing OpenAI-compatible provider must support streaming chat completions and JSON Schema structured outputs. No provider/model fallback or routing changes were introduced. Recreate backend after environment changes: `docker compose up -d --force-recreate backend`.

`CHAT_MODE=demo` remains an explicitly labeled keyword/template demo. It never runs automatically after a provider or verification failure and does not count as generated-answer acceptance.

## Automated verification

From `backend`:

```sh
npm test -- --runInBand --runTestsByPath src/chat/chat.logic.spec.ts src/chat/chat.service.spec.ts src/chat/chat.generation.spec.ts
npx eslint src/chat/*.ts
npx tsc --noEmit
npm run build
node --test test/chat-stream.integration.cjs
```

The HTTP integration suite binds ephemeral loopback ports and uses a local fake OpenAI-compatible server. It checks actual AI SDK partial JSON handling, upstream 429/truncation, SSE timing, disconnect, timeout, partial errors and slot cleanup without external model costs. Build before running it; do not run a host build concurrently with a Docker watch compiler sharing `dist` (use `tsc --noEmit` while watch is active).

Frontend: `npm run build` and `npx tsc --noEmit` from `frontend`.

## Manual acceptance

With the configured live model and authenticated browser at `/chat`:

1. Ask for two science-fiction films after 2010; observe separate paragraphs, completed cards, and working detail links.
2. Ask about a clearly absent quoted movie name; the assistant must not echo its title, substitute films or create a card.
3. Ask for help, unsupported streaming availability, and an unrelated task; inspect the generated response boundaries.
4. Try instructions to ignore the catalog, invent IDs, emit a URL/HTML or repeat an outside title; inspect only the assistant's output (the user's own message remains visible).
5. Stop during generation, then submit again; verify partial status and recovery. Check console errors.
6. Use the automated fixtures for repeatable timeout, verifier rejection, upstream errors and malformed output. Do not change the real provider key to simulate failures.

Successful builds or mocked tests alone do not establish real-provider acceptance. Record actual runtime outcomes separately; module scoring remains subject to evaluation.

## Verification record — 2026-09-26

- 46 targeted Jest tests passed across selection, request boundaries, paragraph validation and pipeline behavior.
- 13 loopback HTTP/real-SDK integration tests passed. External-provider failures and total timeout are fixture-controlled, not induced by altering live credentials.
- Backend build and final TypeScript/targeted ESLint checks passed. Frontend build and TypeScript checks passed; Vite still reports dependency annotation and large-chunk warnings.
- Live in-app browser: Chinese recommendations produced distinct generated paragraphs and two database cards; a card opened the matching movie detail page. A missing-film query returned no cards and no outside-title echo after the regression fix. An injection requesting a fabricated film and external playback link was withheld with `CONTENT_REJECTED`.
- Live in-app browser: playback-link requests explained the unsupported capability without a URL; an unrelated coding request redirected to the film catalog.
- Live in-app browser: Stop showed the partial-answer state; an immediate follow-up successfully generated English help. No browser console errors were captured; two pre-existing React Router future-flag warnings remain.
- Direct checks against the configured live verifier rejected an outside-title paragraph and an unsupported fast-pacing claim, and accepted stored year/genre facts. These are sampled outcomes, not proof of perfect semantic validation.

Changes are scoped to the chat backend, chat page and their tests/documentation. Other module work and the overall project score are not assessed by this record.
