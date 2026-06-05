import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateRankDto {
  @ApiProperty({
    example: 'Bronze',
    description: 'The name of the rank',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 0,
    description: 'Minimum score required for this rank',
  })
  @IsInt()
  @Min(0)
  minScore: number;

  @ApiProperty({
    example: 1000,
    description: 'Maximum score for this rank',
  })
  @IsInt()
  @Min(0)
  maxScore: number;
}
