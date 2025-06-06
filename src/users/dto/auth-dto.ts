import { ApiProperty } from '@nestjs/swagger';

// @ApiProperty({
//   example: 'sae1013@gmail.com',
// })
// readonly email: string;
export class RequestEmailAuthCodeDto {
  @ApiProperty({
    example: 'sae1013@gmail.com',
  })
  email: string;
}


// verifyEmailAuthCode
export class VerifyEmailAuthCodeDto {
  @ApiProperty({
    description: '이메일',
    example: 'sae1013@gmail.com',
  })
  email: string;

  @ApiProperty({
    example: '12312',
  })
  code: string;
}

