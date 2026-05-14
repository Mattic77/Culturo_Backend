import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';

@Injectable()
export class ContinentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContinentDto: CreateContinentDto) {
    try {
      const existingContinent = await this.prisma.continent.findUnique({
        where: { name: createContinentDto.name },
      });

      if (existingContinent) {
        throw new HttpException(
          'Continent with this name already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.prisma.continent.create({
        data: createContinentDto,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create continent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.continent.findMany({
        include: { countries: true },
      });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch continents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const continent = await this.prisma.continent.findUnique({
        where: { id },
        include: { countries: true },
      });

      if (!continent) {
        throw new HttpException('Continent not found', HttpStatus.NOT_FOUND);
      }

      return continent;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch continent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateContinentDto: UpdateContinentDto) {
    try {
      const continent = await this.prisma.continent.findUnique({
        where: { id },
      });

      if (!continent) {
        throw new HttpException('Continent not found', HttpStatus.NOT_FOUND);
      }

      if (updateContinentDto.name) {
        const existingContinent = await this.prisma.continent.findUnique({
          where: { name: updateContinentDto.name },
        });

        if (existingContinent && existingContinent.id !== id) {
          throw new HttpException(
            'Continent with this name already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      return await this.prisma.continent.update({
        where: { id },
        data: updateContinentDto,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update continent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const continent = await this.prisma.continent.findUnique({
        where: { id },
      });

      if (!continent) {
        throw new HttpException('Continent not found', HttpStatus.NOT_FOUND);
      }

      await this.prisma.continent.delete({
        where: { id },
      });

      return { message: 'Continent deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete continent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
