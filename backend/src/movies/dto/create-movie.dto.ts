import { MovieType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 'The Matrix' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'A hacker discovers reality is a simulation.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ enum: MovieType, default: MovieType.MOVIE })
  @IsOptional()
  @IsEnum(MovieType)
  type?: MovieType;

  @ApiProperty({ example: 1999 })
  @Type(() => Number)
  @IsInt()
  releaseYear: number;

  @ApiPropertyOptional({ example: 'https://image.tmdb.org/t/p/w500/poster.jpg' })
  @IsOptional()
  @IsString()
  posterUrl?: string;

  @ApiPropertyOptional({ example: 8.7, minimum: 0, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  averageRating?: number;

  @ApiPropertyOptional({ type: [String], example: ['Sci-Fi', 'Action'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];
}
