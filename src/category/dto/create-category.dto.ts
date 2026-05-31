import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Science', description: 'The name of the category' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'Quick knowledge',
    description: 'Short subtitle for the category, max 3 words',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\s*\S+(?:\s+\S+){0,2}\s*$/, {
    message: 'Subtitle must be 3 words max',
  })
  subtitle?: string;

  @ApiProperty({
    example: 'https://example.com/icon.png',
    description: 'The icon URL of the category',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    example: 'World facts',
    description: 'The category description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
