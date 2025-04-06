import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetPlacesCacheDto {

  @ApiPropertyOptional({ example: 36.78672645698211 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 127.10052131888094 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 3000, description: '반경 기준 m' })
  @IsOptional()
  @IsNumber()
  radius?: number;
}

