import { z } from 'zod';

export const intentSchema = z.object({
  intent: z.enum([
    'recommend',
    'search',
    'details',
    'similar',
    'greeting',
    'help',
    'offtopic',
    'clarify',
  ]),
  language: z.enum(['zh', 'en']),
  search: z
    .string()
    .max(120)
    .describe(
      'Exact title or keywords for search/details; empty for recommendations. Preserve nonexistent titles; do not replace with known films.',
    ),
  referenceId: z
    .number()
    .int()
    .nullable()
    .describe(
      'Database film ID for similar/details, only if present in supplied catalog; otherwise null.',
    ),
  genres: z.array(z.string().max(40)).max(6),
  excludeGenres: z.array(z.string().max(40)).max(6),
  minYear: z.number().int().min(1888).max(2100).nullable(),
  maxYear: z.number().int().min(1888).max(2100).nullable(),
  type: z.enum(['MOVIE', 'TV_SERIES']).nullable(),
  limit: z
    .number()
    .int()
    .min(0)
    .max(6)
    .describe('Use 0 for non-catalog intents, otherwise 1 to 6 results.'),
});
export type ChatIntent = z.infer<typeof intentSchema>;
export type CatalogMovie = {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  type: string;
  averageRating: number;
  ratingIsMock: boolean;
  posterUrl: string | null;
  sourceUrl: string | null;
  genres: { name: string }[];
};

export function selectMovies(
  catalog: CatalogMovie[],
  intent: ChatIntent,
  preferences: string[],
) {
  const reference = catalog.find((m) => m.id === intent.referenceId);
  if (intent.intent === 'similar' && !reference) return [];
  const genres =
    intent.intent === 'similar'
      ? reference!.genres.map((g) => g.name)
      : intent.genres;
  const norm = (s: string) => s.toLocaleLowerCase().normalize('NFKC');
  const wanted = genres.map(norm),
    excluded = intent.excludeGenres.map(norm);
  const preferred = preferences.map(norm);
  return catalog
    .filter((movie) => {
      const names = movie.genres.map((g) => norm(g.name));
      if (intent.intent === 'similar' && movie.id === reference!.id)
        return false;
      if (
        intent.intent === 'details' &&
        intent.referenceId !== null &&
        movie.id !== intent.referenceId
      )
        return false;
      if (
        intent.search &&
        intent.intent !== 'similar' &&
        !(intent.intent === 'details' && intent.referenceId !== null) &&
        !norm(movie.title).includes(norm(intent.search))
      )
        return false;
      return (
        (!intent.type || movie.type === intent.type) &&
        (intent.minYear === null || movie.releaseYear >= intent.minYear) &&
        (intent.maxYear === null || movie.releaseYear <= intent.maxYear) &&
        (!wanted.length || names.some((n) => wanted.includes(n))) &&
        !names.some((n) => excluded.includes(n))
      );
    })
    .map((movie) => {
      const names = movie.genres.map((g) => norm(g.name));
      const overlap = names.filter((n) => wanted.includes(n)).length;
      const preference = names.filter((n) => preferred.includes(n)).length;
      return {
        movie,
        score: overlap * 4 + preference * 2 + movie.averageRating / 10,
      };
    })
    .sort((a, b) => b.score - a.score || a.movie.id - b.movie.id)
    .slice(0, intent.intent === 'details' ? 1 : Math.max(1, intent.limit))
    .map(({ movie }) => movie);
}

// Explicit, visibly labeled offline demo; never silently used after provider failures.
export function demoIntent(text: string, catalog: CatalogMovie[]): ChatIntent {
  const lower = text.toLowerCase();
  const language = /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
  const known = catalog.find((m) => lower.includes(m.title.toLowerCase()));
  const aliases: Record<string, string> = {
    科幻: 'Sci-Fi',
    喜剧: 'Comedy',
    恐怖: 'Horror',
    动作: 'Action',
    爱情: 'Romance',
    动画: 'Animation',
    悬疑: 'Thriller',
  };
  const available = [
    ...new Set(catalog.flatMap((m) => m.genres.map((g) => g.name))),
  ];
  const genres = available.filter((g) => lower.includes(g.toLowerCase()));
  for (const [key, value] of Object.entries(aliases))
    if (text.includes(key)) genres.push(value);
  const excluded = genres.filter(
    (g) =>
      new RegExp(`(?:no|not|without)\\s+${g}`, 'i').test(text) ||
      Object.entries(aliases).some(
        ([k, v]) => v === g && new RegExp(`(?:不要|不看|排除)${k}`).test(text),
      ),
  );
  const quoted = text.match(/["“《]([^"”》]+)["”》]/)?.[1];
  const intent = /^(hi|hello|你好|嗨)[!！。\s]*$/i.test(text)
    ? 'greeting'
    : /help|怎么用|帮助/.test(lower)
      ? 'help'
      : /similar|类似/.test(lower)
        ? 'similar'
        : known || quoted
          ? 'details'
          : /recommend|推荐|movie|film|电影|series|剧/.test(lower) ||
              genres.length
            ? 'recommend'
            : 'offtopic';
  return {
    intent,
    language,
    search: known?.title || quoted || '',
    referenceId: known?.id ?? null,
    genres: [...new Set(genres.filter((g) => !excluded.includes(g)))],
    excludeGenres: excluded,
    minYear: null,
    maxYear: null,
    type: null,
    limit: 4,
  };
}
