import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject, IsEnum } from 'class-validator';
import { Difficulty } from '@prisma/client';

export class CreateQuizDto {
  @ApiProperty({
    example: 'uuid-of-category',
    description: 'The ID of the category this quiz belongs to',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    example: 'uuid-of-country',
    description: 'The ID of the country this quiz is associated with',
    required: false,
  })
  @IsString()
  @IsOptional()
  countryId?: string;

  @ApiProperty({
    example: Difficulty.Easy,
    enum: Difficulty,
    description: 'The difficulty level of the quiz',
    default: Difficulty.Easy,
  })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @ApiProperty({
    example: 'What is the capital of France?',
    description: 'The question for the quiz',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'Paris',
    description: 'The correct answer for the quiz',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    example: { options: ['Paris', 'London', 'Berlin', 'Madrid'] },
    description: 'Suggested answers for the quiz',
    required: false,
  })
  @IsObject()
  @IsOptional()
  suggestedAnswer?: any;
}
