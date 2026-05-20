import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Difficulty } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export enum CountrySelection {
  ALL = 'all',
  RANDOM = 'random',
}

export class StartGameDto {
  @ApiProperty({
    description: 'Specific country ID, "all", or "random"',
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
