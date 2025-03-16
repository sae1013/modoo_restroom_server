import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaceDto } from './create-place.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {
}
