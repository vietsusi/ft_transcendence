import { Server } from 'node:http';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationsModule } from './recommendations.module';

describe('recommendations HTTP boundary', () => {
  let app: INestApplication;
  let token: string;
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ preferredGenres: ['Drama'] }),
    },
    movie: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 9,
          title: 'Stored title',
          type: 'MOVIE',
          releaseYear: 2020,
          averageRating: 9,
          ratingIsMock: true,
          genres: [{ name: 'Drama' }],
        },
      ]),
    },
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [RecommendationsModule],
      providers: [JwtStrategy],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    token = new JwtService({
      secret: process.env.JWT_SECRET || 'supersecret',
    }).sign({ sub: 17 });
  });
  afterAll(async () => {
    await app?.close();
  });
  it('rejects missing or invalid JWTs', async () => {
    await request(app.getHttpServer() as Server)
      .get('/api/recommendations')
      .expect(401);
    await request(app.getHttpServer() as Server)
      .get('/api/recommendations')
      .set('Authorization', 'Bearer invalid')
      .expect(401);
  });
  it('returns real service recommendations and uses the JWT subject', async () => {
    const res = await request(app.getHttpServer() as Server)
      .get('/api/recommendations?limit=1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toMatchObject({
      items: [{ id: 9, recommendation: { matchedGenres: ['Drama'] } }],
      meta: { mode: 'personalized' },
    });
    expect(prisma.user.findUnique).toHaveBeenLastCalledWith({
      where: { id: 17 },
      select: { preferredGenres: true },
    });
  });
  it.each([
    'page=0',
    'page=21',
    'page=1.5',
    'limit=25',
    'limit=0',
    'minYear=no',
    'minYear=1800',
    'maxYear=2101',
    'minYear=2025&maxYear=2000',
    'type=INVALID',
    'userId=5',
    'genre=' + 'x'.repeat(81),
  ])('rejects invalid query %s', async (query) => {
    await request(app.getHttpServer() as Server)
      .get(`/api/recommendations?${query}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
