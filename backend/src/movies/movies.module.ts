import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, PrismaService],
  exports: [MoviesService],
})
export class MoviesModule {}
