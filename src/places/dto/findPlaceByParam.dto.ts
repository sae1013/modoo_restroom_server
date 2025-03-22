import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindPlaceByParamDto {
  @ApiPropertyOptional({ example: '서울특별시 용산구 남산공원길 105', description: '도로명 주소' })
  @IsOptional()
  @IsString()
  roadAddr?: string;

  @ApiPropertyOptional({ example: '서울타워', description: '장소 이름' })
  @IsOptional()
  @IsString()
  name?: string;
}

