import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Difficulty } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export enum CountrySelection {
  ALL = 'all',
  RANDOM = 'random',
}

export class StartGameDto {
  @ApiProperty({
    example: 'uuid-of-category',
    description: 'The ID of the category for the game session',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description:
      'Specific country ID, "all", "random", or omit to use preferred country',
    example: 'all',
    required: false,
  })
  @IsOptional()
  @IsString()
  countrySelection?: string;

  @ApiProperty({
    description: 'Difficulty level: Easy, Medium, Hard, or "random"',
    example: 'Easy',
    required: false,
  })
  @IsOptional()
  @IsString()
  difficulty?: string;
}
