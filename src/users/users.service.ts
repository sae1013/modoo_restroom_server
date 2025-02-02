import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(newUser: CreateUserDto) {
    const duplicatedUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: newUser.email })
      .getOne();
    if (duplicatedUser) {
      // 중복회원
      return;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
