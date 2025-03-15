import { ApiProperty } from '@nestjs/swagger';

export class RequestAuthCodeDto {
  @ApiProperty({
    example: '01083619220',
    description: '핸드폰',
  })
  phoneNumber: string;
}
