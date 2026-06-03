import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { RagService } from './rag.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/guards/roles.decorator';

@ApiTags('rag')
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Ingest text data into knowledge base (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        metadata: { type: 'object' },
      },
    },
  })
  async ingest(@Body() body: { content: string; metadata: any }) {
    return this.ragService.ingestData(body.content, body.metadata);
  }

  @Post('generate-quiz')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Generate quizzes using RAG (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        countryId: { type: 'string' },
        categoryId: { type: 'string' },
        difficulty: { type: 'string', enum: Object.values(Difficulty) },
        count: { type: 'number', default: 1 },
      },
    },
  })
  async generate(
    @Body() body: { countryId: string; categoryId: string; difficulty: Difficulty; count?: number },
  ) {
    return this.ragService.generateQuiz(body.countryId, body.categoryId, body.difficulty, body.count);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search knowledge base' })
  async search(@Query('q') q: string) {
    return this.ragService.searchKnowledge(q);
  }
}
