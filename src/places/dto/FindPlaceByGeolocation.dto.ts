import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindPlaceByGeolocationDto {
  @IsNumber()
  ne_lat: number;

  @IsNumber()
  ne_lng: number;

  @IsNumber()
  sw_lat: number;

  @IsNumber()
  sw_lng: number;
}

