import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, FindUserByEmailDto, LoginUserDto, UpdateUserDto } from './dto/user-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { hashPassword } from '../utils/user.util';
import { Membership } from '../membership/entities/membership.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
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

    // 멤버십과 연결
    const freeMembership = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.name = :name', { name: 'free' })
      .getOne();

    const insertResult = await this.userRepository
      .createQueryBuilder('user')
      .insert()
      .into(User)
      .values({
        email: newUser.email,
        password: hashedPassword,
        name: newUser.name,
        nickname: '푸른달빛 모나카',
        phoneNumber: newUser.phoneNumber,
        membership: { id: freeMembership?.id },
      })
      .returning('*')
      .execute();
    const { email, name, nickname, phoneNumber } = insertResult.raw[0];

    return {
      email, name, nickname, phoneNumber, membershipName: freeMembership?.name,
    };
  }

  async getUserProfile(email: string) {
    const user = await this.userRepository
      .createQueryBuilder('user').where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다.');
    }
    const { password: _ignored, ...result } = user;
    return result;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(userInfo: FindUserByEmailDto) {

  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
