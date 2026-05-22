import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { BattleService } from './battle.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('battle')
@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('history/me')
  @ApiOperation({ summary: 'Get current user battle history' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiOkResponse({ description: 'Battle history retrieved successfully.' })
  getBattleHistory(
    @Request() req: { user: { id: string } },
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.battleService.getBattleHistory(req.user.id, +(skip || 0), +(take || 20));
  }
}
