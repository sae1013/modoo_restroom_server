import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: '새로운 패스워드',
    example: 'sae234234!',
  })
  password: string;

}
