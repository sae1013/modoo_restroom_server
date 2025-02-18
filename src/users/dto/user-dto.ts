import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  readonly email: string;
  readonly password: string;
  readonly nickname?: string;
  readonly name: string;
}

export class LoginUserDto {
  readonly email: string;
  readonly password: string;
}

export class FindUserDto {
  readonly email: string;
  readonly password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
}
