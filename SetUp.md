# Development setup

Use Node.js 22+ and Docker Compose v2+. Run commands from the repository root.

## Start

1. Copy `.env.example` to `.env` if you do not already have one.
2. Set `CHAT_MODE=live`, `CHAT_BASE_URL`, `CHAT_API_KEY`, `CHAT_MODEL` to use your OpenAI-compatible provider. The base URL usually includes `/v1`. Keep secrets in the ignored root `.env`.
3. Run `docker compose up -d --build`.
4. Watch readiness with `docker compose logs -f backend frontend`. First startup installs locked dependencies, generates Prisma Client, applies migrations and imports the checked-in catalog snapshot.

Services:

- Web: http://localhost:5173
- API: http://localhost:5001/api
- Swagger: http://localhost:5001/api/docs
- PostgreSQL: localhost:55432, database/user/password `transcendence/postgres/postgres` (local demo only).
- Inside Docker the API uses `db:5432`, not the host port.

Frontend and backend run in watch mode with bind-mounted source. Container dependencies live in separate volumes, not the host's node_modules. Restart a service after dependency changes. Model environment changes require `docker compose up -d --force-recreate backend`.

Open the site, register or sign in, then select **Chat**. Movies and detail pages use the database. Chat requires login. In explicit `CHAT_MODE=demo`, keyword rules can demonstrate the UI without a model; the banner labels this mode.

## Data

The seed retains the original 24 demo records and upserts 80 cleaned Wikidata films, merging overlaps. See [dataset provenance](backend/data/README.md). Run `docker compose exec backend npx prisma db seed` to repeat import safely.

PostgreSQL data is stored in the project-scoped `db_data` named volume. `docker compose down` stops/removes project containers while keeping data. Do not use global Docker prune commands or `down -v` unless you explicitly intend to delete data.

## Verify

```sh
docker compose ps
curl 'http://localhost:5001/api/movies?limit=1'
docker compose exec backend npm run build
docker compose exec backend npm test -- --runInBand --runTestsByPath src/chat/chat.logic.spec.ts src/chat/chat.service.spec.ts
docker compose exec frontend npm run build
docker compose exec frontend npx tsc --noEmit
```

Use quotes around query URLs in shells that expand `?`. Existing non-chat unit tests still need dependency mocks; the targeted chatbot tests are separate.

## Native development with Docker database

```sh
docker compose up -d db
cd backend
npm ci
npx prisma generate
DATABASE_URL=postgresql://postgres:postgres@localhost:55432/transcendence npx prisma migrate deploy
DATABASE_URL=postgresql://postgres:postgres@localhost:55432/transcendence npx prisma db seed
```

Supply `DATABASE_URL`, `JWT_SECRET`, `PORT=5001` and CHAT variables to the native backend environment before `npm run start:dev`. The root `.env` is automatically read by Compose, not by native Nest startup. In another terminal, `cd frontend && npm ci && npm run dev`.

## Troubleshooting

- Check `docker info`; start Docker Desktop/OrbStack if its daemon is unavailable.
- Host database port 55432 avoids an existing unrelated PostgreSQL on 5432.
- Docker Hub 502: retry or obtain official `node:22` from the AWS Public ECR mirror (`public.ecr.aws/docker/library/node:22`) and tag it locally as `node:22`.
- Chat 503: verify server-side model settings and JSON-output support. The API deliberately does not switch to demo mode after provider errors.
- Do not print `docker compose config` in shared logs: it resolves secret environment values. Use `docker compose config --quiet`.
