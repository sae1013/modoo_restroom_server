import { Injectable } from '@nestjs/common';
import { CreateUserDto, FindUserDto, LoginUserDto, UpdateUserDto } from './dto/user-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { hashPassword } from '../utils/user.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
  }

  async create(newUser: CreateUserDto) {
    const duplicatedUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: newUser.email })
      .getOne();
    if (duplicatedUser) {
      // TODO: 중복회원 에러 처리
      return null;
    }
    const hashedPassword = await hashPassword(newUser.password);

    const insertResult = await this.userRepository
      .createQueryBuilder('user')
      .insert()
      .into(User)
      .values({
        email: newUser.email, password: hashedPassword, name: newUser.name, nickname: newUser.nickname,
      })
      .returning(['email', 'nickname', 'name'])
      .execute();
    return insertResult.raw[0];
  }

  async login(userInfo: LoginUserDto) {
    // 로그인 로직 작성
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(userInfo: FindUserDto) {

  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
