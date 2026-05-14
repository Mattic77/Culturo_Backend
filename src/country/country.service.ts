import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CountryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createCountryDto: CreateCountryDto, file?: Express.Multer.File) {
    console.log('Create country called with:', createCountryDto);
    try {
      const existingCountry = await this.prisma.country.findUnique({
        where: { name: createCountryDto.name },
      });

      if (existingCountry) {
        console.log('Country already exists:', createCountryDto.name);
        throw new HttpException(
          'Country with this name already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('Checking continent with ID:', createCountryDto.continentId);
      const continent = await this.prisma.continent.findUnique({
        where: { id: createCountryDto.continentId },
      });

      if (!continent) {
        console.log(
          'Continent not found for ID:',
          createCountryDto.continentId,
        );
        throw new HttpException('Continent not found', HttpStatus.NOT_FOUND);
      }

      let flagUrl = createCountryDto.flagIcon;

      if (file) {
        const uploadResult = await this.cloudinary.uploadImage(file);
        flagUrl = uploadResult.secure_url;
      } else if (!flagUrl) {
        // Fetch flag from REST Countries API if not provided
        try {
          const response = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(createCountryDto.name)}?fullText=true`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0 && data[0].flags) {
              flagUrl = data[0].flags.png || data[0].flags.svg;
            }
          }
        } catch (apiError) {
          console.error('REST Countries API error:', apiError.message);
          // Fallback: continue without flag if API fails
        }
      }

      return await this.prisma.country.create({
        data: {
          ...createCountryDto,
          flagIcon: flagUrl,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create country',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.country.findMany({
        include: { continent: true },
      });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch countries',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const country = await this.prisma.country.findUnique({
        where: { id },
        include: { continent: true },
      });

      if (!country) {
        throw new HttpException('Country not found', HttpStatus.NOT_FOUND);
      }

      return country;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch country',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateCountryDto: UpdateCountryDto,
    file?: Express.Multer.File,
  ) {
    try {
      const country = await this.prisma.country.findUnique({
        where: { id },
      });

      if (!country) {
        throw new HttpException('Country not found', HttpStatus.NOT_FOUND);
      }

      if (updateCountryDto.name) {
        const existingCountry = await this.prisma.country.findUnique({
          where: { name: updateCountryDto.name },
        });

        if (existingCountry && existingCountry.id !== id) {
          throw new HttpException(
            'Country with this name already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (updateCountryDto.continentId) {
        const continent = await this.prisma.continent.findUnique({
          where: { id: updateCountryDto.continentId },
        });

        if (!continent) {
          throw new HttpException('Continent not found', HttpStatus.NOT_FOUND);
        }
      }

      let flagUrl = updateCountryDto.flagIcon;

      if (file) {
        const uploadResult = await this.cloudinary.uploadImage(file);
        flagUrl = uploadResult.secure_url;
      } else if (!flagUrl && updateCountryDto.name) {
        // Fetch flag from REST Countries API if name is updated but flag is not provided
        try {
          const response = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(updateCountryDto.name)}?fullText=true`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0 && data[0].flags) {
              flagUrl = data[0].flags.png || data[0].flags.svg;
            }
          }
        } catch (apiError) {
          console.error('REST Countries API error:', apiError.message);
        }
      }

      return await this.prisma.country.update({
        where: { id },
        data: {
          ...updateCountryDto,
          flagIcon: flagUrl,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update country',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const country = await this.prisma.country.findUnique({
        where: { id },
      });

      if (!country) {
        throw new HttpException('Country not found', HttpStatus.NOT_FOUND);
      }

      await this.prisma.country.delete({
        where: { id },
      });

      return { message: 'Country deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete country',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
