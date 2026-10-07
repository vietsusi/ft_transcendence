import {
  normalizeGenre,
  rankRecommendations,
  RecommendationMovie,
} from './recommendations.logic';
const movie = (
  id: number,
  genres = ['Drama'],
  overrides: Partial<RecommendationMovie> = {},
): RecommendationMovie => ({
  id,
  genres: genres.map((name) => ({ name })),
  type: 'MOVIE',
  releaseYear: 2000,
  averageRating: 8,
  ratingIsMock: true,
  ...overrides,
});
describe('content recommendations', () => {
  it('prioritizes matching genres and explains the stored match', () => {
    const result = rankRecommendations(
      [movie(1), movie(2, ['Sci-Fi'])],
      ['SCI FI'],
      2,
      2026,
    );
    expect(result.mode).toBe('personalized');
    expect(result.ranked[0].movie.id).toBe(2);
    expect(result.ranked[0].recommendation.matchedGenres).toEqual(['Sci-Fi']);
  });
  it('deduplicates preferences and normalizes whitespace / unicode', () => {
    const catalog = [movie(1), movie(2, ['Comedy'])];
    expect(rankRecommendations(catalog, [' Drama ', 'Ｄｒａｍａ'], 2)).toEqual(
      rankRecommendations(catalog, ['Drama'], 2),
    );
    expect(normalizeGenre('Science Fiction')).toBe('sci-fi');
  });
  it('falls back to discovery for missing or unavailable preferences', () => {
    for (const preferences of [[], ['Unknown']]) {
      expect(rankRecommendations([movie(1)], preferences, 10).mode).toBe(
        'discovery',
      );
    }
  });
  it('does not change ordering when mock scores change', () => {
    const a = [
      movie(1, ['Drama'], { averageRating: 1 }),
      movie(2, ['Drama'], { averageRating: 10 }),
    ];
    const b = a.map((m) => ({ ...m, averageRating: 11 - m.averageRating }));
    expect(rankRecommendations(a, [], 2).ranked.map((r) => r.movie.id)).toEqual(
      rankRecommendations(b, [], 2).ranked.map((r) => r.movie.id),
    );
    expect(
      rankRecommendations(a, [], 2).ranked.every(
        (r) => !r.recommendation.reasons.includes('Strong catalog score'),
      ),
    ).toBe(true);
  });
  it('uses real scores, treats missing scores neutrally, and clamps quality', () => {
    const catalog = [
      movie(1, ['Drama'], { ratingIsMock: false, averageRating: 0 }),
      movie(2, ['Drama'], { ratingIsMock: false, averageRating: 9 }),
    ];
    expect(rankRecommendations(catalog, [], 2).ranked[0].movie.id).toBe(2);
    expect(
      rankRecommendations(catalog, [], 2).ranked[0].recommendation.reasons,
    ).toContain('Strong catalog score');
    expect(
      rankRecommendations([movie(1, [], { averageRating: NaN })], [], 1).ranked,
    ).toHaveLength(1);
  });
  it('keeps relevance dominant while diversifying close candidates', () => {
    const catalog = [movie(1), movie(2), movie(3, ['Comedy'])];
    expect(
      rankRecommendations(catalog, [], 3).ranked.map((r) => r.movie.id),
    ).toEqual([1, 3, 2]);
    expect(
      rankRecommendations(catalog, ['Drama'], 3)
        .ranked.slice(0, 2)
        .map((r) => r.movie.id),
    ).toEqual([1, 2]);
  });
  it('supports empty genres and catalogs without mutating inputs', () => {
    expect(rankRecommendations([], [], 12).ranked).toEqual([]);
    const catalog = [movie(2, []), movie(1, [])];
    const original = JSON.stringify(catalog);
    expect(
      rankRecommendations(catalog, [], 10).ranked.map((r) => r.movie.id),
    ).toEqual([1, 2]);
    expect(JSON.stringify(catalog)).toBe(original);
  });
  it('produces stable prefixes independent of catalog order or page size', () => {
    const catalog = Array.from({ length: 30 }, (_, i) =>
      movie(i + 1, [i % 2 ? 'Comedy' : 'Drama']),
    );
    const short = rankRecommendations(catalog, ['Drama', 'Comedy'], 12).ranked;
    const full = rankRecommendations(
      [...catalog].reverse(),
      ['Drama', 'Comedy'],
      30,
    ).ranked;
    expect(full.slice(0, 12)).toEqual(short);
    expect(new Set(full.map((r) => r.movie.id)).size).toBe(30);
  });
  it('does not describe future titles as recent releases', () => {
    const result = rankRecommendations(
      [movie(1, [], { releaseYear: 2030 })],
      [],
      1,
      2026,
    );
    expect(result.ranked[0].recommendation.reasons).not.toContain(
      'A recent release',
    );
  });
});
