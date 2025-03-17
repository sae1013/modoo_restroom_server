import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateLikeDto {
  @ApiProperty({
    description: '좋아요 대상의 id',
    example: '1',
  })
  @IsString()
  likeableId: string;

  @ApiProperty({
    description: '좋아요 대상 타입 / 장소, 댓글 (PLACE, COMMENT)',
    example: 'PLACE',
  })
  @IsString()
  likeableType: 'PLACE';
}
