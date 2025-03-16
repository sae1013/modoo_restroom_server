import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindPlaceByIdDto {
  @ApiPropertyOptional({ example: 1, description: '장소 ID' })
  @IsNumber()
  id: number;
}