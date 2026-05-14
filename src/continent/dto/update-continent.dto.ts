import { PartialType } from '@nestjs/swagger';
import { CreateContinentDto } from './create-continent.dto';

export class UpdateContinentDto extends PartialType(CreateContinentDto) {}
