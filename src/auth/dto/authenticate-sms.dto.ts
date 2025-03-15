import { ApiProperty } from '@nestjs/swagger';

export class AuthenticateSmsDto {
  @ApiProperty({
    example: '01083619220',
    description: '인증번호 요청',
  })
  phoneNumber: string;

  @ApiProperty({
    example: '35982',
    description: '핸드폰번호',
  })
  authCode: string;
}
