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
  Query,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
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

import { GetQuizzesFilterDto } from './dto/get-quizzes-filter.dto';

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new quiz (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The quiz has been successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid data provided.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiOperation({ summary: 'Get all quizzes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all quizzes.',
  })
  findAll(@Query() filter: GetQuizzesFilterDto) {
    return this.quizService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quiz by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the quiz.',
  })
  @ApiNotFoundResponse({ description: 'Quiz not found.' })
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a quiz (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The quiz has been successfully updated.',
  })
  @ApiNotFoundResponse({ description: 'Quiz not found.' })
  @ApiBadRequestResponse({
    description: 'Invalid data provided.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a quiz (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The quiz has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Quiz not found.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }
}
