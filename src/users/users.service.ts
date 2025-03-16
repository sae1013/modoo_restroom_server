import { BadRequestException, Body, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, FindUserByEmailDto, LoginUserDto, UpdateUserDto } from './dto/user-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { hashPassword } from '../utils/user.util';
import { Membership } from '../membership/entities/membership.entity';
import { GmailSmtpService } from '../gmail-smtp/gmail-smtp.service';
import { ConfigService } from '@nestjs/config';
import { RequestPasswordResetVerificationCodeDto } from './dto/request-password-verification.dto';
import { generateVerificationCode } from '../utils/utils';
import { RedisClientType } from 'redis';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    @Inject(GmailSmtpService) private gmailSmtpService: GmailSmtpService,
    @Inject('REDIS_CLIENT')
    private redisClient: RedisClientType,
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
      email, name, nickname, phoneNumber, membership: { name: freeMembership?.name },
    };
  }

  async getUserProfileByEmail(email: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .leftJoinAndSelect('user.membership', 'membership')
      .select([
        'user.id',
        'user.email',
        'user.name',
        'user.nickname',
        'user.phoneNumber',
        'membership.name',
      ])
      .getOne();
    console.log(user);
    if (!user) {
      throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다.');
    }

    const { password: _ignored, ...result } = user;
    return result;
  }

  async requestPasswordResetVerificationCode({ email }: RequestPasswordResetVerificationCodeDto) {
    const redisAuthCodeKey = `passwordReset:authCode:${email}`;
    const redisAuthCode = await this.redisClient.get(redisAuthCodeKey);
    if (redisAuthCode) {
      return new BadRequestException('이미 요청된 인증이 있습니다.');
    }

    const verificationCode = generateVerificationCode();
    const mailSubject = '[해우소] 비밀번호 재설정을 위한 인증코드를 발급해드립니다.';
    const mailText = `[해우소] 비밀번호 재설정을 위한 인증코드를 발급해드립니다. 인증코드: ${verificationCode}, 10분이내 인증코드를 입력해주세요`;
    const mailHtml = `<h1>[해우소] 비밀번호 재설정을 위한 인증코드를 발급해드립니다.</h1> 
    <h3>인증코드: ${verificationCode}</h3>
    <p>10분 이내에 인증코드를 입력해주세요.</p>`;

    await this.gmailSmtpService.sendMail(email, mailSubject, mailText, mailHtml);
    await this.redisClient.set(redisAuthCodeKey, verificationCode, {
      EX: 60 * 3,
    });
    return;
  }

  async passwordResetVerifyCode() {

  }

  async resetPassword() {

  }

  findAll() {
    return `This action returns all users`;
  }


  // findOne(userInfo: FindUserByEmailDto) {
  //
  // }
  //
  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // 유저정보를 토큰에서 빼온다음...
  remove() {

  }
}
