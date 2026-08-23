# Movie API — Integration Guide (Person A / Lin)

Base URL (local): `http://localhost:5000/api`
Interactive docs (Swagger): `http://localhost:5000/api/docs`

All list/detail/search/genre endpoints are **public (no auth)**.
Write endpoints (POST/PUT/DELETE) require the header `x-api-key: <API_KEY>`.

---

## Data shapes

**Movie**
```json
{
  "id": 1,
  "title": "The Matrix",
  "description": "A hacker discovers reality is a simulation...",
  "type": "MOVIE",              // "MOVIE" | "TV_SERIES"
  "releaseYear": 1999,
  "posterUrl": "https://image.tmdb.org/t/p/w500/....jpg",
  "averageRating": 8.7,          // 0–10
  "createdAt": "2026-08-16T00:00:00.000Z",
  "updatedAt": "2026-08-16T00:00:00.000Z",
  "genres": [{ "id": 5, "name": "Sci-Fi" }, { "id": 1, "name": "Action" }]
}
```

**Genre**
```json
{ "id": 5, "name": "Sci-Fi" }
```

---

## Endpoints

### 1. List movies — `GET /movies`
Supports filtering, sorting, pagination. All query params are optional.

| Param | Type | Notes |
|---|---|---|
| `search` | string | matches title OR description (case-insensitive) |
| `genre` | string | genre name, e.g. `Sci-Fi` (case-insensitive) |
| `type` | `MOVIE` \| `TV_SERIES` | |
| `year` | int | exact release year |
| `minYear` / `maxYear` | int | year range (ignored if `year` is set) |
| `minRating` / `maxRating` | number | 0–10 |
| `sortBy` | `title` \| `releaseYear` \| `averageRating` \| `createdAt` | default `createdAt` |
| `sortOrder` | `asc` \| `desc` | default `desc` |
| `page` | int | default `1` |
| `limit` | int | default `12`, max `100` |

**Response**
```json
{
  "items": [ /* Movie[] */ ],
  "pagination": { "page": 1, "limit": 12, "total": 24, "totalPages": 2 }
}
```

Example:
`GET /movies?genre=Sci-Fi&type=MOVIE&minRating=8&sortBy=averageRating&sortOrder=desc&page=1&limit=12`

### 2. Search — `GET /movies/search`
Same query params and same response shape as `GET /movies`.
(The frontend `movieApi.searchMovies` maps here.)

### 3. Movie detail — `GET /movies/:id`
Returns a single **Movie** (with `genres`). Returns **404** if the id does not exist.

### 4. Genres — `GET /genres`
Returns `Genre[]` sorted by name. Use this to populate genre filter dropdowns.

### 5. Create movie — `POST /movies`  *(requires `x-api-key`)*
Body:
```json
{
  "title": "Dune",
  "description": "A noble family becomes embroiled in a war for a desert planet.",
  "type": "MOVIE",
  "releaseYear": 2021,
  "posterUrl": "https://...jpg",
  "averageRating": 8.0,
  "genres": ["Sci-Fi", "Adventure"]
}
```
`title`, `description`, `releaseYear` are required. Unknown genres are created automatically. Returns the created Movie with genres.

### 6. Update movie — `PUT /movies/:id`  *(requires `x-api-key`)*
Body: any subset of the create fields. If `genres` is provided, it **replaces** the movie's genres. Returns the updated Movie. 404 if id missing.

### 7. Delete movie — `DELETE /movies/:id`  *(requires `x-api-key`)*
Returns `{ "id": <id>, "deleted": true }`. 404 if id missing.

---

## For Person C (Recommendations & Analytics)
- Use `GET /movies` with `genre` + `minRating` + `sortBy=averageRating` to fetch candidate movies per favorite genre.
- Each Movie already includes its `genres` array, so you can compute favorite-genre matches without extra joins.
- To exclude already-watched movies, filter by `Movie.id` on your side (watch history lives in Person B's tables).
- `averageRating` on Movie is editorial/seed data for now. If you later compute averages from user ratings, coordinate with me before changing the field's meaning.

## For Person D (Frontend)
- The existing `frontend/src/api/movieApi.js` calls already match these routes (`/movies`, `/movies/:id`, `/movies/search`, `/genres`).
- List/search responses are `{ items, pagination }` — read `res.data.items` for the grid and `res.data.pagination` for paging controls.
- Genre dropdown: `GET /genres`.

## Rate limiting & errors
- Global rate limit: **100 requests / 60s per IP** (429 on exceed).
- Validation errors return **400** with a message (e.g. `year=abc`, `limit=999`).
- Missing/invalid API key on write endpoints returns **401**.

## Notes
- API key for local Docker is set in `docker-compose.yml` (`API_KEY`). Send it as the `x-api-key` header.
- Movie/TV are one table distinguished by `type` (`MOVIE` / `TV_SERIES`).
