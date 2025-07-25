import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewWithPlaceDto {
  @ApiProperty({
    description: '장소 고유 id',
    example: 1,
  })
  @IsNumber()
  placeId: number;

  // 지번 혹은 도로명 주소
  @ApiProperty({
    description: '지번 혹은 도로명 주소',
    example: '송파타운 111',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '도로명주소',
    example: '송파대로 111',
  })
  @IsString()
  roadAddress;

  @ApiProperty({
    description: '지번주소',
    example: '124-24',
  })
  @IsString()
  jibunAddress;

  @IsNumber()
  lat;

  @IsNumber()
  lng;

  // 건물의 정보들이 추가됨.
  @IsNumber()
  rating: number;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  option1: boolean;

  @IsOptional()
  @IsBoolean()
  option2: boolean;

  @IsOptional()
  @IsBoolean()
  option3: boolean;

  @IsOptional()
  @IsBoolean()
  option4: boolean;

  @IsOptional()
  @IsBoolean()
  option5: boolean;

  @IsOptional()
  @IsBoolean()
  option6: boolean;
}
