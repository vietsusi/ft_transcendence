import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryRecommendationsDto } from './query-recommendations.dto';
import { rankRecommendations, normalizeGenre } from './recommendations.logic';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: number, query: QueryRecommendationsDto) {
    if (
      query.minYear !== undefined &&
      query.maxYear !== undefined &&
      query.minYear > query.maxYear
    ) {
      throw new BadRequestException(
        'Minimum year must not exceed maximum year',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferredGenres: true },
    });
    if (!user) throw new NotFoundException('User no longer exists');
    const catalog = await this.prisma.movie.findMany({
      where: {
        ...(query.type ? { type: query.type } : {}),
        ...(query.minYear !== undefined || query.maxYear !== undefined
          ? {
              releaseYear: {
                ...(query.minYear !== undefined ? { gte: query.minYear } : {}),
                ...(query.maxYear !== undefined ? { lte: query.maxYear } : {}),
              },
            }
          : {}),
      },
      include: { genres: true },
      orderBy: { id: 'asc' },
    });
    const genre = query.genre?.trim() ? normalizeGenre(query.genre) : undefined;
    const candidates = genre
      ? catalog.filter((movie) =>
          movie.genres.some((g) => normalizeGenre(g.name) === genre),
        )
      : catalog;
    const page = query.page ?? 1,
      limit = query.limit ?? 12;
    const { ranked, mode } = rankRecommendations(
      candidates,
      user.preferredGenres,
      page * limit,
    );
    const total = candidates.length;
    return {
      items: ranked
        .slice((page - 1) * limit)
        .map(({ movie, recommendation }) => ({ ...movie, recommendation })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.min(20, Math.ceil(total / limit)),
        windowLimited: total > 20 * limit,
      },
      meta: {
        algorithm: 'content-diversity-v2',
        mode,
        preferredGenres: user.preferredGenres,
        signals: [
          'genre-preferences',
          'catalog-score',
          'release-year',
          'diversity',
        ],
      },
    };
  }
}
