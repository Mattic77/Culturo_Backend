import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContinentDto {
  @ApiProperty({ example: 'Africa', description: 'The name of the continent' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
