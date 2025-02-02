import { PartialType } from '@nestjs/mapped-types';
import { CreateRestroomDto } from './create-restroom.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateRestroomDto extends PartialType(CreateRestroomDto) {}
