import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QueryRecommendationsDto } from './query-recommendations.dto';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get explainable recommendations using your saved preferences',
  })
  find(
    @Req() req: Request & { user: { id: number } },
    @Query() query: QueryRecommendationsDto,
  ) {
    return this.recommendations.findForUser(req.user.id, query);
  }
}
