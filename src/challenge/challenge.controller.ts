import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ChallengeStatus, Usertype } from '@prisma/client';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@ApiTags('challenge')
@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new challenge (Admin only)' })
  @ApiCreatedResponse({ description: 'Challenge created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  create(@Body() createChallengeDto: CreateChallengeDto) {
    return this.challengeService.create(createChallengeDto);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update challenge status (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(ChallengeStatus),
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Challenge status updated successfully.' })
  @ApiNotFoundResponse({ description: 'Challenge not found.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ChallengeStatus,
  ) {
    return this.challengeService.updateStatus(id, status);
  }

  @Patch(':id/is-public')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update challenge public visibility / selection (Admin only)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isPublic: { type: 'boolean' },
      },
    },
  })
  @ApiOkResponse({ description: 'Challenge visibility updated successfully.' })
  @ApiNotFoundResponse({ description: 'Challenge not found.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  updateIsPublic(@Param('id') id: string, @Body('isPublic') isPublic: boolean) {
    return this.challengeService.updateIsPublic(id, isPublic);
  }

  @Get('selected')
  @ApiOperation({ summary: 'Get all selected (public) challenges' })
  @ApiOkResponse({ description: 'List of public challenges.' })
  getSelectedChallenges() {
    return this.challengeService.getSelectedChallenges();
  }

  @Get()
  @ApiOperation({ summary: 'Get all challenges' })
  @ApiOkResponse({ description: 'List of all challenges.' })
  findAll() {
    return this.challengeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a challenge by ID' })
  @ApiOkResponse({ description: 'The challenge details.' })
  @ApiNotFoundResponse({ description: 'Challenge not found.' })
  findOne(@Param('id') id: string) {
    return this.challengeService.findOne(id);
  }
}
