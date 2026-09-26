# Catalog assistant

Authenticated `POST /api/chat` accepts AI SDK UI messages and responds with its UI-message SSE protocol. `GET /api/chat/status` exposes mode/configuration readiness, never credentials.

## Grounding and ranking

Vercel AI SDK `generateText` + `Output.object` extracts a bounded intent using `@ai-sdk/openai-compatible`. The model never generates displayed film titles, URLs or factual prose. The backend validates the intent and filters the current database catalog (bounded to 500 rows for this demo), including positive/negative genres, type and inclusive year bounds. Named missing films and unknown similarity IDs yield zero results, not replacement titles.

Score = 4 × requested/reference genre overlaps + 2 × saved-preference overlaps + catalog score / 10. Sort descending, ties by database ID; maximum six results. Similarity excludes the reference film. Imported scores are mocked and visibly labeled. This is explainable content-based ranking, not collaborative filtering; no watch-history/rating model exists yet.

Responses use server-authored templates and database cards with `/movies/:id` links. Detail responses expose only stored description/genres/year/score. No generated plots, cast, streaming availability or outside-title suggestions. Greetings and site help have short fixed replies. Unrelated topics politely redirect; unsupported/ambiguous requests ask for title/genre/year. Provider failures return an explicit error, never silently use demo mode.

Conversation text and previous result IDs are sent on each request. The server rehydrates card IDs from its own catalog to resolve “the second film” safely. Client-supplied card titles and URLs are ignored. Histories are page-local, not persisted server-side; max 24 messages/24,000 total text characters/4,000 per part, model timeout 30 seconds. Cancel aborts the provider request. JWT protection and the existing global rate limiter apply. No SQL is produced or executed by the model.

## Configuration

Root `.env`: `CHAT_MODE=live`, `CHAT_BASE_URL` (including `/v1` when required), `CHAT_API_KEY`, `CHAT_MODEL`. Provider must support OpenAI-compatible chat completions with JSON Schema structured output (`supportsStructuredOutputs: true`). Non-catalog intents may specify zero results; catalog selection remains bounded to one–six. Recreate backend after edits: `docker compose up -d --force-recreate backend`.

`CHAT_MODE=demo` is an explicit keyword-only mode, displayed in the UI. It supports simple genres, known English titles, quoted missing titles and off-topic responses. It does not claim general natural-language/multi-turn understanding.

Frontend uses `@ai-sdk/react` and official AI Elements Message/Conversation registry components. React was updated to 19 for these components; existing Tailwind 3 styling is retained. Diagram/code/math plugins are omitted because answers are catalog text and cards.

## Verification

`npm test -- --runInBand --runTestsByPath src/chat/chat.logic.spec.ts src/chat/chat.service.spec.ts`

Checks absent titles, exclusions, type/year constraints, preferences, similarity, invalid outputs and request size/role limits. Existing non-chat skeleton tests are separately known to lack dependency mocks.
