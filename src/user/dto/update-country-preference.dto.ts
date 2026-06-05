import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCountryPreferenceDto {
  @ApiProperty({
    example: 'uuid-of-country or "all"',
    description: 'The ID of the country to prefer, or "all" to reset preference.',
  })
  @IsString()
  @IsNotEmpty()
  countryId: string;
}
