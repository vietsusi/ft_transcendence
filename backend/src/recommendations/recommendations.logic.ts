/** Pure, deterministic content ranking. No user behavior or mock-rating signals. */
export type RecommendationMovie = {
  id: number;
  type: string;
  releaseYear: number;
  averageRating: number;
  ratingIsMock: boolean;
  genres: { name: string }[];
};

export function normalizeGenre(value: string) {
  const normalized = value.normalize('NFKC').trim().toLowerCase();
  return ['sci-fi', 'sci fi', 'science fiction'].includes(normalized)
    ? 'sci-fi'
    : normalized;
}

export function rankRecommendations<T extends RecommendationMovie>(
  catalog: T[],
  preferences: string[],
  count: number,
  year = new Date().getUTCFullYear(),
) {
  const frequencies = new Map<string, number>();
  const genreSets = new Map(
    catalog.map((movie) => [
      movie.id,
      new Set(movie.genres.map((genre) => normalizeGenre(genre.name))),
    ]),
  );
  for (const genres of genreSets.values()) {
    for (const genre of genres) {
      frequencies.set(genre, (frequencies.get(genre) ?? 0) + 1);
    }
  }
  const preferred = new Set(
    preferences.map(normalizeGenre).filter((genre) => frequencies.has(genre)),
  );
  const personalized = preferred.size > 0;
  const weight = (genre: string) =>
    1 + Math.log((catalog.length + 1) / ((frequencies.get(genre) ?? 0) + 1));
  const norm = (genres: Set<string>) =>
    Math.sqrt([...genres].reduce((sum, genre) => sum + weight(genre) ** 2, 0));
  const preferenceNorm = norm(preferred);
  const candidates = catalog.map((movie) => {
    const genres = genreSets.get(movie.id)!;
    const matchedGenres = movie.genres
      .filter((genre) => preferred.has(normalizeGenre(genre.name)))
      .map((genre) => genre.name);
    const dot = [...genres].reduce(
      (sum, genre) => sum + (preferred.has(genre) ? weight(genre) ** 2 : 0),
      0,
    );
    const affinity = dot / (preferenceNorm * norm(genres) || 1);
    // Missing, zero or synthetic ratings provide no quality advantage.
    const hasRating =
      !movie.ratingIsMock &&
      Number.isFinite(movie.averageRating) &&
      movie.averageRating > 0;
    const quality = hasRating ? Math.min(10, movie.averageRating) / 10 : 0.5;
    const recency = Math.max(0, 1 - Math.max(0, year - movie.releaseYear) / 50);
    const score = personalized
      ? 0.7 * affinity + 0.2 * quality + 0.1 * recency
      : 0.65 * quality + 0.35 * recency;
    const reasons = [
      matchedGenres.length
        ? `Matches your ${matchedGenres.join(' / ')} preferences`
        : personalized
          ? 'Explore beyond your usual genres'
          : 'Discover a title from the catalog',
    ];
    if (hasRating && movie.averageRating >= 7)
      reasons.push('Strong catalog score');
    if (movie.releaseYear <= year && movie.releaseYear >= year - 5)
      reasons.push('A recent release');
    return { movie, genres, matchedGenres, reasons, score, similarity: 0 };
  });
  const ranked: {
    movie: T;
    recommendation: { matchedGenres: string[]; reasons: string[] };
  }[] = [];
  // Incremental maximal-similarity updates keep cost O(catalog size * requested prefix).
  const penalty = personalized ? 0.12 : 0.2;
  while (ranked.length < Math.min(count, catalog.length)) {
    let best = 0;
    for (let i = 1; i < candidates.length; i++) {
      const candidate = candidates[i],
        incumbent = candidates[best];
      const delta =
        candidate.score -
        penalty * candidate.similarity -
        (incumbent.score - penalty * incumbent.similarity);
      if (
        delta > 1e-12 ||
        (Math.abs(delta) <= 1e-12 && candidate.movie.id < incumbent.movie.id)
      )
        best = i;
    }
    const [selected] = candidates.splice(best, 1);
    ranked.push({
      movie: selected.movie,
      recommendation: {
        matchedGenres: selected.matchedGenres,
        reasons: selected.reasons,
      },
    });
    for (const candidate of candidates) {
      const intersection = [...candidate.genres].filter((genre) =>
        selected.genres.has(genre),
      ).length;
      const union = new Set([...candidate.genres, ...selected.genres]).size;
      const similarity =
        0.85 * (union ? intersection / union : 0) +
        (candidate.movie.type === selected.movie.type ? 0.15 : 0);
      candidate.similarity = Math.max(candidate.similarity, similarity);
    }
  }
  return {
    ranked,
    mode: personalized ? ('personalized' as const) : ('discovery' as const),
  };
}
