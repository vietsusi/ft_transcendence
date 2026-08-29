import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryMoviesDto } from './dto/query-movies.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryMoviesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.movie.findMany({
        where,
        include: { genres: true },
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: { genres: true },
    });
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  getGenres() {
    return this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
  }

  create(dto: CreateMovieDto) {
    return this.prisma.movie.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        releaseYear: dto.releaseYear,
        posterUrl: dto.posterUrl,
        averageRating: dto.averageRating ?? 0,
        genres: dto.genres
          ? {
              connectOrCreate: dto.genres.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: { genres: true },
    });
  }

  async update(id: number, dto: UpdateMovieDto) {
    await this.findOne(id);
    return this.prisma.movie.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        releaseYear: dto.releaseYear,
        posterUrl: dto.posterUrl,
        averageRating: dto.averageRating,
        genres: dto.genres
          ? {
              set: [],
              connectOrCreate: dto.genres.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: { genres: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.movie.delete({ where: { id } });
    return { id, deleted: true };
  }

  private buildWhere(query: QueryMoviesDto): Prisma.MovieWhereInput {
    const where: Prisma.MovieWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.genre) {
      where.genres = { some: { name: { equals: query.genre, mode: 'insensitive' } } };
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.year !== undefined) {
      where.releaseYear = query.year;
    } else if (query.minYear !== undefined || query.maxYear !== undefined) {
      where.releaseYear = {
        ...(query.minYear !== undefined ? { gte: query.minYear } : {}),
        ...(query.maxYear !== undefined ? { lte: query.maxYear } : {}),
      };
    }

    if (query.minRating !== undefined || query.maxRating !== undefined) {
      where.averageRating = {
        ...(query.minRating !== undefined ? { gte: query.minRating } : {}),
        ...(query.maxRating !== undefined ? { lte: query.maxRating } : {}),
      };
    }

    return where;
  }
}
