import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryRecommendationsDto {
  @ApiPropertyOptional({ enum: ['MOVIE', 'TV_SERIES'] })
  @IsOptional()
  @IsIn(['MOVIE', 'TV_SERIES'])
  type?: 'MOVIE' | 'TV_SERIES';

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  genre?: string;

  @ApiPropertyOptional({ minimum: 1888, maximum: 2100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1888)
  @Max(2100)
  minYear?: number;

  @ApiPropertyOptional({ minimum: 1888, maximum: 2100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1888)
  @Max(2100)
  maxYear?: number;

  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  page: number = 1;

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  limit: number = 12;
}
