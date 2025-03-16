import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetVerificationCodeDto {
  @ApiProperty(
    {
      description: '이메일',
      example: 'sae1013@gmail.com',
    })
  email: string;
}
