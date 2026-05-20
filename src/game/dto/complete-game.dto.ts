import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteGameDto {
  @ApiProperty({ description: 'The active game session ID to complete' })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;
}
