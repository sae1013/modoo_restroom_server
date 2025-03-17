import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: '새로운 패스워드',
    example: 'sae234234!',
  })
  password: string;

  @ApiProperty({
    description: '이메일',
    example: 'sae1013@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: '인증코드',
    example: '12312',
  })
  authCode: string;
}
