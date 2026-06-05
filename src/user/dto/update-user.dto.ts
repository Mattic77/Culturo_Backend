import {
  IsString,
  IsOptional,
  IsEmail,
  IsDate,
  IsNotEmpty,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'new_username', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'newemail@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '2000-01-15', required: false })
  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;

  @ApiProperty({ example: 'uuid-of-country', required: false })
  @IsOptional()
  @IsUUID()
  preferredCountryId?: string;
}

export class UpdateCountryPreferenceDto {
  @ApiProperty({
    example: 'uuid-of-country or "all"',
    description:
      'The ID of the country to prefer, or "all" to reset preference.',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|all)$/i,
    {
      message: 'countryId must be a valid UUID or "all"',
    },
  )
  countryId: string;
}
