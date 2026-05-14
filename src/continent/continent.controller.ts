import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ContinentService } from './continent.service';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Usertype } from '@prisma/client';

@ApiTags('continent')
@Controller('continent')
export class ContinentController {
  constructor(private readonly continentService: ContinentService) {}

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new continent (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The continent has been successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'Continent name already exists or invalid data.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  create(@Body() createContinentDto: CreateContinentDto) {
    return this.continentService.create(createContinentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all continents' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all continents.',
  })
  findAll() {
    return this.continentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a continent by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the continent.',
  })
  @ApiNotFoundResponse({ description: 'Continent not found.' })
  findOne(@Param('id') id: string) {
    return this.continentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a continent (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The continent has been successfully updated.',
  })
  @ApiNotFoundResponse({ description: 'Continent not found.' })
  @ApiBadRequestResponse({
    description: 'Continent name already exists or invalid data.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  update(
    @Param('id') id: string,
    @Body() updateContinentDto: UpdateContinentDto,
  ) {
    return this.continentService.update(id, updateContinentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a continent (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The continent has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Continent not found.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  remove(@Param('id') id: string) {
    return this.continentService.remove(id);
  }
}
