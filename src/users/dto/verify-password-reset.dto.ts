import { ApiProperty } from '@nestjs/swagger';

export class VerifyPasswordResetDto {
  @ApiProperty(
    {
      description: '이메일',
      example: 'sae1013@gmail.com',
    })
  email: string;

  @ApiProperty({
    description: '인증코드',
    example: '93939',
  })
  authCode: string;
}

