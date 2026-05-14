import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 'Morocco', description: 'The name of the country' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'https://example.com/flag.png',
    description: 'The flag icon URL of the country',
    required: false,
  })
  @IsString()
  @IsOptional()
  flagIcon?: string;

  @ApiProperty({
    example: 'uuid-of-africa',
    description: 'The continent ID of the country',
  })
  @IsString()
  @IsNotEmpty()
  continentId: string;
}
