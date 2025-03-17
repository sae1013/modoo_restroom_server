import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateLikeDto {
  @ApiProperty({
    description: '좋아요 대상의 id(PK)',
    example: 1,
  })
  @IsString()
  likeableId: number;

  @ApiProperty({
    description: '좋아요 대상 타입 / 장소, 후기 (PLACE, REVIEW)',
    example: 'PLACE',
  })
  @IsString()
  likeableType: 'PLACE';

@ApiProperty({
  description: '좋아요(1), 싫어요(0) 구분',
  example: 1,
})

}
