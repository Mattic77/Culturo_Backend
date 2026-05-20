import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Difficulty } from '@prisma/client';

export class GetQuizzesFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by category ID',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by country ID',
  })
  @IsOptional()
  @IsString()
  countryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by difficulty level',
    enum: Difficulty,
  })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;
}
