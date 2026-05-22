import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Usertype } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
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

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get global top 10 players by XP and Rank' })
  @ApiOkResponse({ description: 'Leaderboards retrieved successfully.' })
  getLeaderboard() {
    return this.progressionService.getLeaderboard();
  }

  // --- Admin Endpoints ---

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @Post('ranks')
  @ApiOperation({ summary: 'Create a new rank (Admin only)' })
  @ApiCreatedResponse({ description: 'Rank created successfully.' })
  createRank(@Body() data: { name: string; minScore: number; maxScore: number }) {
    return this.progressionService.createRank(data);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @Patch('ranks/:id')
  @ApiOperation({ summary: 'Update a rank (Admin only)' })
  @ApiOkResponse({ description: 'Rank updated successfully.' })
  updateRank(
    @Param('id') id: string,
    @Body() data: { name?: string; minScore?: number; maxScore?: number },
  ) {
    return this.progressionService.updateRank(id, data);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @Delete('ranks/:id')
  @ApiOperation({ summary: 'Delete a rank (Admin only)' })
  @ApiOkResponse({ description: 'Rank deleted successfully.' })
  deleteRank(@Param('id') id: string) {
    return this.progressionService.deleteRank(id);
  }
}
