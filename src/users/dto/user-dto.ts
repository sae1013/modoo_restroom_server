import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty(
    {
      description: '이메일',
      example: 'sae1013@gmail.com',
    },
  )
  readonly email: string;

  @ApiProperty(
    {
      description: '패스워드',
      example: 'qweqrdf1234124',
    },
  )
  readonly password: string;

  readonly nickname?: string;

  @ApiProperty({
    description: '이름(본명)',
    example: '홍길동',
  })
  readonly name: string;
}

export class LoginUserDto {
  @ApiProperty({
    example: 'sae1013@gmail.com',
  })
  readonly email: string;

  @ApiProperty({
    example: 'qweqrdf1234124',
  })
  readonly password: string;
}

export class FindUserByEmailDto {
  @ApiProperty({
    example: 'sae1013@gmail.com',
  })
  readonly email: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
}

