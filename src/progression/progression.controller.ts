import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('progression')
@Controller('progression')
export class ProgressionController {
  constructor(private readonly progressionService: ProgressionService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('level')
  @ApiOperation({ summary: 'Get current user level and XP progress' })
  @ApiOkResponse({ description: 'User level information retrieved successfully.' })
  getUserLevel(@Request() req: { user: { id: string } }) {
    return this.progressionService.getUserLevel(req.user.id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('ranks/me')
  @ApiOperation({ summary: 'Get current user ranks (Online & Offline)' })
  @ApiOkResponse({ description: 'User rank information retrieved successfully.' })
  getUserRanks(@Request() req: { user: { id: string } }) {
    return this.progressionService.getUserRanks(req.user.id);
  }

  @Get('ranks')
  @ApiOperation({ summary: 'Get list of all possible ranks' })
  @ApiOkResponse({ description: 'List of ranks retrieved successfully.' })
  getAllRanks() {
    return this.progressionService.getAllRanks();
  }
}
