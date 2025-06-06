import {
  BadRequestException,
  Body, HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserDto,
  FindUserByEmailDto,
  UpdateUserDto,
} from './dto/user-dto';
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
import { VerifyPasswordResetDto } from './dto/verify-password-reset.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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
      email,
      name,
      nickname,
      phoneNumber,
      membership: { name: freeMembership?.name },
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
      throw new UnauthorizedException('해당 메일로 가입된 계정이 없습니다.');
    }

    const { password: _ignored, ...result } = user;
    return result;
  }

  // 이메일 인증코드 발송
  async requestEmailAuthCode(email: string) {
    const redisAuthCodeKey = `email:authCode:${email}`;
    const redisAuthCode = await this.redisClient.get(redisAuthCodeKey);
    if (redisAuthCode) {
      throw new BadRequestException('이미 요청된 인증이 있습니다.');
    }
    const verificationCode = generateVerificationCode();
    const mailSubject =
      '[해우소] 이메일 인증 위한 인증코드를 발급해드립니다.';
    const mailText = `[해우소] 이메일 인증 위한 인증코드를 발급해드립니다. 인증코드: ${verificationCode}, 10분이내 인증코드를 입력해주세요`;
    const mailHtml = `<h1>[해우소] 이메일 인증을 위한 인증코드를 발급해드립니다.</h1> 
    <h3>인증코드: ${verificationCode}</h3>
    <p>10분 이내에 인증코드를 입력해주세요.</p>`;

    await this.gmailSmtpService.sendMail(
      email,
      mailSubject,
      mailText,
      mailHtml,
    );
    await this.redisClient.set(redisAuthCodeKey, verificationCode, {
      EX: 60 * 10,
    });
    return;
  }

  // 이메일 인증코드 인증
  async verifyEmailAuthCode(email: string, code: string) {
    const redisAuthCodeKey = `email:authCode:${email}`;
    const redisAuthCode = await this.redisClient.get(redisAuthCodeKey);
    await this.redisClient.del(redisAuthCodeKey);
    if (code === redisAuthCode) {
      // 인증성공
      return {
        code: HttpStatus.OK,
        result: 200,
      };

    } else {
      throw new BadRequestException({
        code: HttpStatus.BAD_REQUEST,
        message: '인증 코드가 유효하지 않습니다.',
      });
    }
  }

  async requestPasswordResetVerificationCode({
                                               email,
                                             }: RequestPasswordResetVerificationCodeDto) {
    await this.getUserProfileByEmail(email);
    const redisAuthCodeKey = `passwordReset:authCode:${email}`;
    const redisAuthCode = await this.redisClient.get(redisAuthCodeKey);
    if (redisAuthCode) {
      throw new BadRequestException('이미 요청된 인증이 있습니다.');
    }

    const verificationCode = generateVerificationCode();
    const mailSubject =
      '[해우소] 비밀번호 재설정을 위한 인증코드를 발급해드립니다.';
    const mailText = `[해우소] 비밀번호 재설정을 위한 인증코드를 발급해드립니다. 인증코드: ${verificationCode}, 10분이내 인증코드를 입력해주세요`;
    const mailHtml = `<h1>[해우소] 비밀번호 재설정을 위한 인증코드를 발급해드립니다.</h1> 
    <h3>인증코드: ${verificationCode}</h3>
    <p>10분 이내에 인증코드를 입력해주세요.</p>`;

    await this.gmailSmtpService.sendMail(
      email,
      mailSubject,
      mailText,
      mailHtml,
    );
    await this.redisClient.set(redisAuthCodeKey, verificationCode, {
      EX: 60 * 10,
    });
    return;
  }

  async passwordResetVerifyCode({ email, authCode }: VerifyPasswordResetDto) {
    const redisAuthCodeKey = `passwordReset:authCode:${email}`;
    const redisAuthCode = await this.redisClient.get(redisAuthCodeKey);
    if (!redisAuthCode) {
      throw new BadRequestException('만료된 인증입니다.');
    }
    if (authCode !== redisAuthCode) {
      throw new BadRequestException('인증코드가 다릅니다.');
    }
  }

  // 비밀번호 변경하기
  async changePassword(email, password) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.email', 'user.password'])
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new BadRequestException({
        message: '유저 정보를 가져오는데 실패했습니다.',
        code: HttpStatus.BAD_REQUEST,
      });
    }
    // 변경하려는 암호 평문, 해시암호를 비교
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      throw new BadRequestException('기존 패스워드와 동일합니다.');
    }

    const hashedPassword = await hashPassword(password);
    const updateResult = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ password: hashedPassword })
      .where('email= :email', { email })
      .execute();

    if (updateResult.affected === 0) {
      throw new BadRequestException({
        message: '비밀번호 변경이 실패했습니다.',
        code: HttpStatus.BAD_REQUEST,
      });
    }

    return {
      code: HttpStatus.OK,
      result: 200,
    };
  }

  async findAll() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.membership', 'membership')
      .orderBy('user.createdAt', 'DESC')
      .getMany();
    return users;
  }

  async getUserProfile(userId) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.membership', 'membership')
      .where('user.id = :userId', { userId })
      .getOne();
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  // findOne(userInfo: FindUserByEmailDto) {
  //
  // }
  //
  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // 회원탈퇴
  async remove(userId: number) {
    const updateResult = await this.userRepository.update(
      {
        id: userId,
      },
      { isActive: false },
    );
    if (!updateResult.affected) {
      throw new NotFoundException('탈퇴에러');
    }
  }
}
