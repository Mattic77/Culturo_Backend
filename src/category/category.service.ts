import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    file?: Express.Multer.File,
  ) {
    try {
      const existingCategory = await this.prisma.category.findUnique({
        where: { name: createCategoryDto.name },
      });

      if (existingCategory) {
        throw new HttpException(
          'Category with this name already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      let iconUrl = createCategoryDto.icon;

      if (file) {
        const uploadResult = await this.cloudinary.uploadImage(file);
        iconUrl = uploadResult.secure_url;
      }

      return await this.prisma.category.create({
        data: {
          ...createCategoryDto,
          icon: iconUrl,
        },
      });
    } catch (error) {
      console.error('Category create error:', (error as any)?.message ?? error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      const quizQuantities = await this.prisma.quiz.groupBy({
        by: ['categoryId'],
        _count: { id: true },
      });
      const categories = await this.prisma.category.findMany();
      return categories.map((category) => {
        const quizquantity =
          quizQuantities.find((q) => q.categoryId === category.id)?._count.id ||
          0;
        return {
          ...category,
          quizquantity,
        };
      });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      return category;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      if (updateCategoryDto.name) {
        const existingCategory = await this.prisma.category.findUnique({
          where: { name: updateCategoryDto.name },
        });

        if (existingCategory && existingCategory.id !== id) {
          throw new HttpException(
            'Category with this name already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      let iconUrl = updateCategoryDto.icon;

      if (file) {
        const uploadResult = await this.cloudinary.uploadImage(file);
        iconUrl = uploadResult.secure_url;
      }

      return await this.prisma.category.update({
        where: { id },
        data: {
          ...updateCategoryDto,
          icon: iconUrl,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      await this.prisma.category.delete({
        where: { id },
      });

      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
