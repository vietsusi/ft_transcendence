import { Prisma } from '@prisma/client';
import { RecommendationsService } from './recommendations.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueryRecommendationsDto } from './query-recommendations.dto';
const catalog = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `Film ${i + 1}`,
  genres: [{ name: i % 2 ? 'Sci-Fi' : 'Drama' }],
  type: 'MOVIE',
  releaseYear: 2020,
  averageRating: 8,
}));
describe('recommendations service', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    movie: {
      findMany: jest.fn<Promise<typeof catalog>, [Prisma.MovieFindManyArgs]>(),
    },
  };
  const service = new RecommendationsService(
    prisma as unknown as PrismaService,
  );
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({ preferredGenres: ['Sci-Fi'] });
    prisma.movie.findMany.mockResolvedValue(catalog);
  });
  it('reads only the authenticated user preferences and preserves movie fields', async () => {
    const result = await service.findForUser(7, new QueryRecommendationsDto());
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 7 },
      select: { preferredGenres: true },
    });
    expect(result.items[0]).toMatchObject({
      title: 'Film 2',
      recommendation: { matchedGenres: ['Sci-Fi'] },
    });
    expect(result.pagination).toMatchObject({ total: 30, totalPages: 3 });
  });
  it('hard filters type and year at the database boundary and normalizes genre', async () => {
    const query = {
      ...new QueryRecommendationsDto(),
      type: 'TV_SERIES' as const,
      minYear: 2000,
      maxYear: 2025,
      genre: ' Science Fiction ',
    };
    const result = await service.findForUser(7, query);
    expect(prisma.movie.findMany.mock.calls[0][0].where).toEqual({
      type: 'TV_SERIES',
      releaseYear: { gte: 2000, lte: 2025 },
    });
    expect(result.items.every((m) => m.genres[0].name === 'Sci-Fi')).toBe(true);
    expect(result.pagination.total).toBe(15);
  });
  it('returns disjoint stable pages and empty out-of-range results', async () => {
    const first = await service.findForUser(7, new QueryRecommendationsDto());
    const second = await service.findForUser(7, {
      ...new QueryRecommendationsDto(),
      page: 2,
    });
    expect(second.items).toHaveLength(12);
    expect(
      second.items.every((m) => !first.items.some((f) => f.id === m.id)),
    ).toBe(true);
    expect(
      (
        await service.findForUser(7, {
          ...new QueryRecommendationsDto(),
          page: 4,
        })
      ).items,
    ).toEqual([]);
  });
  it('rejects reversed years before database access', async () => {
    await expect(
      service.findForUser(7, {
        ...new QueryRecommendationsDto(),
        minYear: 2025,
        maxYear: 2000,
      }),
    ).rejects.toThrow('Minimum year');
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
  it('handles deleted users and an empty catalog', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.findForUser(7, new QueryRecommendationsDto()),
    ).rejects.toThrow('User no longer exists');
    prisma.movie.findMany.mockResolvedValueOnce([]);
    expect(
      await service.findForUser(7, new QueryRecommendationsDto()),
    ).toMatchObject({
      items: [],
      pagination: { total: 0, totalPages: 0 },
      meta: { mode: 'discovery' },
    });
  });
  it('reads updated preferences each time without leaking across users', async () => {
    const first = await service.findForUser(7, new QueryRecommendationsDto());
    prisma.user.findUnique.mockResolvedValueOnce({
      preferredGenres: ['Drama'],
    });
    const second = await service.findForUser(8, new QueryRecommendationsDto());
    expect(first.items[0].recommendation.matchedGenres).toEqual(['Sci-Fi']);
    expect(second.items[0].recommendation.matchedGenres).toEqual(['Drama']);
  });
  it('explicitly reports a bounded pagination window for large catalogs', async () => {
    prisma.movie.findMany.mockResolvedValueOnce(
      Array.from({ length: 500 }, (_, i) => ({ ...catalog[0], id: i + 1 })),
    );
    const result = await service.findForUser(7, new QueryRecommendationsDto());
    expect(result.pagination).toMatchObject({
      total: 500,
      totalPages: 20,
      windowLimited: true,
    });
  });
});
