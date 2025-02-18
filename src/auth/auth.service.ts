import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository
      .createQueryBuilder('user').where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('가입하지 않은 계정입니다');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }

    const { password: _ignored, ...result } = user;
    return result;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
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
}
