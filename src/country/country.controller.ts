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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Usertype } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import * as multer from 'multer';

@ApiTags('country')
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('flagIcon', { storage: multer.memoryStorage() }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new country (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        continentId: { type: 'string' },
        flagIcon: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The country has been successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'Country name already exists or invalid data.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  create(
    @Body() createCountryDto: CreateCountryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.countryService.create(createCountryDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all countries.',
  })
  findAll() {
    return this.countryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a country by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the country.',
  })
  @ApiNotFoundResponse({ description: 'Country not found.' })
  findOne(@Param('id') id: string) {
    return this.countryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('flagIcon', { storage: multer.memoryStorage() }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a country (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        continentId: { type: 'string' },
        flagIcon: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The country has been successfully updated.',
  })
  @ApiNotFoundResponse({ description: 'Country not found.' })
  @ApiBadRequestResponse({
    description: 'Country name already exists or invalid data.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  update(
    @Param('id') id: string,
    @Body() updateCountryDto: UpdateCountryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.countryService.update(id, updateCountryDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a country (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The country has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Country not found.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  remove(@Param('id') id: string) {
    return this.countryService.remove(id);
  }
}
