import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { ChallengeStatus } from '@prisma/client';

export class UpdateChallengeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startAt?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endAt?: string;

  @ApiProperty({ enum: ChallengeStatus, required: false })
  @IsEnum(ChallengeStatus)
  @IsOptional()
  status?: ChallengeStatus;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  score?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
