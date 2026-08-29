import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { QueryMoviesDto } from './dto/query-movies.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ApiKeyGuard } from './api-key.guard';

@ApiTags('movies')
@Controller()
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('movies')
  @ApiOperation({ summary: 'List movies with filters, sorting and pagination' })
  findAll(@Query() query: QueryMoviesDto) {
    return this.moviesService.findAll(query);
  }

  // Declared before ':id' so "search" is not treated as an id.
  @Get('movies/search')
  @ApiOperation({ summary: 'Advanced search across movies and TV series' })
  search(@Query() query: QueryMoviesDto) {
    return this.moviesService.findAll(query);
  }

  @Get('movies/:id')
  @ApiOperation({ summary: 'Get a single movie by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }

  @Get('genres')
  @ApiOperation({ summary: 'List all genres' })
  getGenres() {
    return this.moviesService.getGenres();
  }

  @Post('movies')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Create a movie (requires API key)' })
  create(@Body() dto: CreateMovieDto) {
    return this.moviesService.create(dto);
  }

  @Put('movies/:id')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Update a movie (requires API key)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMovieDto) {
    return this.moviesService.update(id, dto);
  }

  @Delete('movies/:id')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Delete a movie (requires API key)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.remove(id);
  }
}
