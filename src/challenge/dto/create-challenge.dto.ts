import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { ChallengeStatus } from '@prisma/client';

export class CreateChallengeDto {
  @ApiProperty({
    example: 'New monthly challenge',
    description: 'The description of the challenge',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2026-06-01T00:00:00Z',
    description: 'When the challenge starts',
  })
  @IsDateString()
  @IsOptional()
  startAt?: string;

  @ApiProperty({
    example: '2026-06-30T23:59:59Z',
    description: 'When the challenge ends',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endAt?: string;

  @ApiProperty({
    example: ChallengeStatus.PENDING,
    enum: ChallengeStatus,
    description: 'The status of the challenge',
    default: ChallengeStatus.PENDING,
  })
  @IsEnum(ChallengeStatus)
  @IsOptional()
  status?: ChallengeStatus;

  @ApiProperty({
    example: 1000,
    description: 'Target score for the challenge',
    default: 0,
  })
  @IsInt()
  @IsOptional()
  score?: number;

  @ApiProperty({
    example: false,
    description: 'Whether the challenge is public/selected',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
