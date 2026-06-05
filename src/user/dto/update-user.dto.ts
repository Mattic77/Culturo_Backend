import { IsString, IsOptional, IsEmail, IsDate } from 'class-validator';
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
  @IsString()
  preferredCountryId?: string;
}
