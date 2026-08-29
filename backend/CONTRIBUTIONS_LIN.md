# Person A (Lin) — Individual Contributions: Movie/TV Database & API

> Area of ownership: Movie & TV Series database, movie APIs, advanced search, Public API.
> Modules covered: Public API (2 pts), Advanced Search (1 pt), ORM (1 pt).

---

## 1. Database models (Movie / Genre)
File: `backend/prisma/schema.prisma`
- Added `MovieType` enum: `MOVIE` / `TV_SERIES` (movies and series share one table, distinguished by `type`).
- Added `Movie` model: `id`, `title`, `description`, `type` (default MOVIE), `releaseYear`, `posterUrl` (nullable), `averageRating` (default 0), `createdAt`, `updatedAt`.
- Added `Genre` model: `id`, `name` (unique).
- Defined a **many-to-many** relation between `Movie` and `Genre` via `@relation("MovieGenres")`.
- Added `@@index` on `type`, `releaseYear`, and `averageRating` to speed up filtering/sorting.

## 2. Database migration (hand-written SQL)
File: `backend/prisma/migrations/20260816000000_add_movies/migration.sql`
- **Hand-wrote the migration SQL** following Prisma's generation conventions: the enum, `Genre` table, `Movie` table, implicit join table `_MovieGenres`, plus all indexes and foreign keys (`ON DELETE CASCADE`).
- Purpose: `prisma migrate deploy` can create the tables inside the container without first running `migrate dev` locally.

## 3. Query DTO + validation
File: `backend/src/movies/dto/query-movies.dto.ts`
- Defined all list/search query params: `search`, `genre`, `type`, `year`, `minYear`/`maxYear`, `minRating`/`maxRating`, `sortBy`, `sortOrder`, `page`, `limit`.
- Validated with `class-validator` (`minRating` 0–10, `limit` max 100, `sortBy` whitelist); `@Type(() => Number)` converts URL string params to numbers. Invalid params return **400**.

## 4. Business logic (Service)
File: `backend/src/movies/movies.service.ts`
- `findAll(query)`: builds the Prisma `where` dynamically via a private `buildWhere()` —
  - `search` matches title and description (case-insensitive);
  - `genre` matches related genre names with `some`;
  - `year` exact match, or `minYear`/`maxYear` range;
  - rating uses `minRating`/`maxRating` range;
  - uses `$transaction` to fetch the current page and total count together, returning `{ items, pagination }`.
- `findOne(id)`: returns a single movie with `genres`; throws **404** if not found.
- `getGenres()`: returns all genres sorted by name.
- `create(dto)`: creates a movie; genres use `connectOrCreate` (created automatically if missing).
- `update(id, dto)`: checks existence first, then updates; if `genres` is provided, `set: []` clears then reconnects (replace semantics).
- `remove(id)`: checks existence first, then deletes; returns `{ id, deleted: true }`.

## 5. Routes (Controller)
File: `backend/src/movies/movies.controller.ts`
- Read endpoints (no auth): `GET /movies`, `GET /movies/search`, `GET /movies/:id`, `GET /genres`.
- **`/movies/search` is declared before `/movies/:id`** so `search` is not treated as an id.
- Write endpoints (require API key): `POST /movies`, `PUT /movies/:id`, `DELETE /movies/:id`, guarded by `@UseGuards(ApiKeyGuard)`.
- Added Swagger `@ApiOperation` to every endpoint, and `@ApiSecurity('api-key')` on write endpoints.

## 6. API key guard
File: `backend/src/movies/api-key.guard.ts`
- Reads the `x-api-key` header and compares it to the `API_KEY` env var; throws **401** on mismatch (the "secured API key" required by the Public API module).

## 7. Write endpoint DTOs
Files: `backend/src/movies/dto/create-movie.dto.ts`, `update-movie.dto.ts`
- `CreateMovieDto`: `title`/`description`/`releaseYear` required, others optional, with validation and Swagger `@ApiProperty`.
- `UpdateMovieDto`: `PartialType(CreateMovieDto)`, all fields optional.

## 8. Seed data
File: `backend/prisma/seed.ts`
- 12 genres + 24 movies/series across varied types, years, and ratings.
- **Idempotent**: genres use `upsert`, movies are skipped if a title+year already exists — re-running never inserts duplicates.

## 9. Global configuration (App level)
- `backend/src/main.ts`: global `ValidationPipe` (`whitelist` + `forbidNonWhitelisted`); Swagger docs at `/api/docs`; CORS now reads the `FRONTEND_URL` env var (fixed the hard-coded `5174` that did not match the frontend port).
- `backend/src/app.module.ts`: registered `MoviesModule`; added global rate limiting `ThrottlerModule` (100 requests / 60s per IP) + `ThrottlerGuard`.

## 10. Docker / deployment / environment
- `docker-compose.yml`: expanded from "frontend only" to **db (postgres:16) + backend + frontend**; db has a healthcheck, backend starts after db is healthy, and on startup runs "migrate → seed → start".
- `backend/Dockerfile` + `backend/.dockerignore`: created; Node 20, installs dependencies + `prisma generate`.
- `backend/package.json`: added dependencies `class-validator`, `class-transformer`, `@nestjs/swagger`, `@nestjs/throttler`, `swagger-ui-express`; added `prisma.seed` config and `prisma:seed`/`prisma:migrate` scripts.
- `backend/.env.example`: added `API_KEY`, `FRONTEND_URL`; `SetUp.md`: fixed the incorrect `mariadb` reference to PostgreSQL.

## 11. Integration documentation
File: `backend/MOVIE_API.md`
- API usage guide for Person C (recommendations/analytics) and Person D (frontend): endpoints, params, response shapes, auth, and rate limiting.

---

## Running & verification
```bash
docker compose up -d --build
```
- Swagger docs: `http://localhost:5000/api/docs`
- Read endpoints: `GET /api/movies`, `/api/movies/search?search=matrix`, `/api/movies/1`, `/api/genres`
- Write endpoints (require `x-api-key` header): `POST/PUT/DELETE /api/movies`

## Challenges faced and how they were overcome
- **No Node/Docker on the local machine, so Prisma migrations could not be generated locally** → hand-wrote the migration SQL following Prisma conventions so `migrate deploy` works inside the container.
- **Repo stack differed from the proposal** (proposal said Express, repo uses NestJS) → kept NestJS to avoid rewriting the existing auth/users modules.
- **Database inconsistency** (SetUp.md mentioned mariadb, schema uses postgresql) → standardized on PostgreSQL and fixed the docs.
- **Hard-coded CORS port bug** (`5174` vs frontend `5173`) → switched to reading the `FRONTEND_URL` env var.
