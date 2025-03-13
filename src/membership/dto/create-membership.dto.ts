import { MembershipTierEnum } from '../entities/membership.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMembershipDto {
  @ApiProperty({
    example: 'free',
    description: '멤버십 등급 (ENUM) / free, premium, vip ',
  })
  name: MembershipTierEnum;

  @ApiProperty({
    example: 30000,
    description: '가격',
  })
  price: number;

  @ApiProperty({
    example: '혜택없음/광고시청',
  })
  benefits: string;
}
