import {
  Body,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RedisClientType } from 'redis';
import { RequestAuthCodeDto } from './dto/request-auth-code.dto';
import { generateVerificationCode } from 'src/utils/utils';
import { AuthenticateSmsDto } from './dto/authenticate-sms.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,

    @Inject('REDIS_CLIENT')
    private redisClient: RedisClientType,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
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

  async requestAuthCode({ phoneNumber }: RequestAuthCodeDto) {
    const cachedAuthCode =
      (await this.redisClient.get(`authCode-${phoneNumber}`)) || '';

    if (cachedAuthCode) {
      return { errCode: 'MO201', errMsg: '3분 후 다시시도해주세요' };
    }
    //
    const authCode = generateVerificationCode();
    await this.redisClient.set(`authCode-${phoneNumber}`, authCode, {
      EX: 60 * 3,
    });

    return authCode;
  }
  // sms를 날려서 인증번호를 요청한다.  만약 캐시 hit 인 경우, 에러코드 반환
  async authenticateSmsCode(@Body() authenticateSmsDto: AuthenticateSmsDto) {
    const { phoneNumber, authCode } = authenticateSmsDto;
    const redisKey = `authCode-${phoneNumber}`;
    const cachedAuthCode = (await this.redisClient.get(redisKey)) || '';
    if (!cachedAuthCode) {
      return new Error('인증번호가 만료되었습니다.');
    }

    if (authCode !== cachedAuthCode) {
      return new Error('인증번호가 틀립니다.');
    }
    // 성공시, 캐시를 날리고 200응답.
    await this.redisClient.del(redisKey);
    return 200;
  }
}
