import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'The active game session ID' })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: 'The ID of the question being answered' })
  @IsUUID()
  @IsNotEmpty()
  quizId: string;

  @ApiProperty({ description: 'The user\'s answer text' })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
