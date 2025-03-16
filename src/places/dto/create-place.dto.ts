import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { PlaceTypeEnum } from '../entities/place.entity';

export class CreatePlaceDto {
  @ApiProperty({ example: '서울타워', description: '주소 or 건물 이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: '서울특별시 용산구 남산공원길 105', description: '도로명주소' })
  @IsString()
  roadAddr: string;

  @ApiPropertyOptional({
    example: PlaceTypeEnum.PRIVATE,
    enum: PlaceTypeEnum,
    description: '장소 타입 (기본값: PRIVATE)',
  })
  @IsEnum(PlaceTypeEnum)
  @IsOptional() // 필수 입력이 아님
  type?: PlaceTypeEnum;

  @ApiProperty({ example: 37.551169, description: '위도' })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 126.988227, description: '경도' })
  @IsNumber()
  lng: number;

}
