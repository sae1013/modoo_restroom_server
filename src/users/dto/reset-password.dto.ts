import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'Sae123412@',
  })
  password: string;

  @ApiProperty({
    example: 'sae1013@gmail.com',
  })
  email: string;
}
