import {
  selectMovies,
  demoIntent,
  intentSchema,
  type CatalogMovie,
  type ChatIntent,
} from './chat.logic';

const movies: CatalogMovie[] = [
  {
    id: 1,
    title: 'Space One',
    releaseYear: 2000,
    genres: [{ name: 'Sci-Fi' }],
    type: 'MOVIE',
    description: 'Stored facts',
    averageRating: 7,
    ratingIsMock: true,
    posterUrl: null,
    sourceUrl: null,
  },
  {
    id: 2,
    title: 'Space Horror',
    releaseYear: 2015,
    genres: [{ name: 'Sci-Fi' }, { name: 'Horror' }],
    type: 'MOVIE',
    description: 'Stored facts',
    averageRating: 9,
    ratingIsMock: true,
    posterUrl: null,
    sourceUrl: null,
  },
  {
    id: 3,
    title: 'Laugh',
    releaseYear: 2020,
    genres: [{ name: 'Comedy' }],
    type: 'TV_SERIES',
    description: 'Stored facts',
    averageRating: 8,
    ratingIsMock: false,
    posterUrl: null,
    sourceUrl: null,
  },
];
const base: ChatIntent = {
  intent: 'recommend',
  language: 'en',
  search: '',
  referenceId: null,
  genres: [],
  excludeGenres: [],
  minYear: null,
  maxYear: null,
  type: null,
  limit: 4,
};
describe('catalog grounding', () => {
  it('never substitutes another film for an absent title', () =>
    expect(
      selectMovies(
        movies,
        { ...base, intent: 'details', search: 'Invented Film' },
        [],
      ),
    ).toEqual([]));
  it('enforces positive AND negative filters before ranking', () =>
    expect(
      selectMovies(
        movies,
        { ...base, genres: ['Sci-Fi'], excludeGenres: ['Horror'] },
        [],
      ).map((m) => m.id),
    ).toEqual([1]));
  it('enforces year and media type', () =>
    expect(
      selectMovies(movies, { ...base, minYear: 2010, type: 'MOVIE' }, []).map(
        (m) => m.id,
      ),
    ).toEqual([2]));
  it('ranks saved preferences above a larger score', () =>
    expect(selectMovies(movies, base, ['Comedy'])[0].id).toBe(3));
  it('similarity excludes source and requires overlapping genres', () =>
    expect(
      selectMovies(
        movies,
        { ...base, intent: 'similar', referenceId: 1 },
        [],
      ).map((m) => m.id),
    ).toEqual([2]));
  it('does not invent an unknown reference', () =>
    expect(
      selectMovies(
        movies,
        { ...base, intent: 'similar', referenceId: 999 },
        [],
      ),
    ).toEqual([]));
  it('rejects unbounded or invalid model output', () =>
    expect(intentSchema.safeParse({ ...base, limit: 100 }).success).toBe(
      false,
    ));
  it('handles quoted unknown titles in explicit demo mode', () =>
    expect(demoIntent('Tell me about "Invented Film"', movies).search).toBe(
      'Invented Film',
    ));
  it('redirects unrelated questions in demo mode', () =>
    expect(demoIntent('What is the weather?', movies).intent).toBe('offtopic'));
  it('accepts zero results for non-catalog intents', () =>
    expect(
      intentSchema.safeParse({ ...base, intent: 'offtopic', limit: 0 }).success,
    ).toBe(true));
});
