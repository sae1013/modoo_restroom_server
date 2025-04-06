import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReviewWithPlaceDto {

  @IsNumber()
  placeId: number;

  // 지번 혹은 도로명 주소
  @IsString()
  name: string;

  @IsString()
  roadAddress;

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
