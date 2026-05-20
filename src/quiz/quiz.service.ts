import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto) {
    try {
      // Validate Category
      const category = await this.prisma.category.findUnique({
        where: { id: createQuizDto.categoryId },
      });
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      // Validate Country if provided
      if (createQuizDto.countryId) {
        const country = await this.prisma.country.findUnique({
          where: { id: createQuizDto.countryId },
        });
        if (!country) {
          throw new HttpException('Country not found', HttpStatus.NOT_FOUND);
        }
      }

      return await this.prisma.quiz.create({
        data: createQuizDto,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create quiz',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(filter?: { categoryId?: string; countryId?: string; difficulty?: string }) {
    try {
      const where: any = {};
      if (filter?.categoryId) {
        where.categoryId = filter.categoryId;
      }
      if (filter?.countryId) {
        where.countryId = filter.countryId;
      }
      if (filter?.difficulty) {
        where.difficulty = filter.difficulty;
      }

      return await this.prisma.quiz.findMany({
        where,
        include: {
          category: true,
          country: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch quizzes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id },
        include: {
          category: true,
          country: true,
        },
      });

      if (!quiz) {
        throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
      }

      return quiz;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch quiz',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id },
      });

      if (!quiz) {
        throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
      }

      if (updateQuizDto.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: updateQuizDto.categoryId },
        });
        if (!category) {
          throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
      }

      if (updateQuizDto.countryId) {
        const country = await this.prisma.country.findUnique({
          where: { id: updateQuizDto.countryId },
        });
        if (!country) {
          throw new HttpException('Country not found', HttpStatus.NOT_FOUND);
        }
      }

      return await this.prisma.quiz.update({
        where: { id },
        data: updateQuizDto,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update quiz',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id },
      });

      if (!quiz) {
        throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
      }

      await this.prisma.quiz.delete({
        where: { id },
      });

      return { message: 'Quiz deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete quiz',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
