import {
  BadRequestException,
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
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
import { generateVerificationCode, getRandomNickName } from '../utils/utils';
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
  ) {}

  async generateUniqueNickName(): Promise<string> {
    const ATTEMPT = 100;
    for (let i = 0; i < ATTEMPT; i++) {
      const nickName = getRandomNickName();

      const exists = await this.userRepository
        .createQueryBuilder('user')
        .where('user.nickname = :nickname', { nickname: nickName })
        .getExists();

      if (!exists) {
        return nickName;
      }
    }
    // 100번 초과시.
    throw new InternalServerErrorException({
      message: '남은 닉네임이 없습니다. 관리자에게 문의하세요',
      code: '500',
    });
  }

  async create(newUser: CreateUserDto) {
    // 이미 해당 이메일로 가입한 유저가 있는지 (탈퇴 유저 포함)
    const duplicatedUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: newUser.email })
      .getOne();

    // 탈퇴 유저인경우 복구처리
    if (duplicatedUser && !duplicatedUser?.isActive) {
      // 탈퇴한 가입일이 30일 미만인 경우는 가입불가 메시지처리.
      if (duplicatedUser.deletedAt) {
        const now = Date.now();
        const deletedTime = new Date(duplicatedUser.deletedAt).getTime();
        const daysSinceDeleted = (now - deletedTime) / (1000 * 60 * 60 * 24);
        if (daysSinceDeleted < 30) {
          throw new BadRequestException({
            message: '재가입은 탈퇴 후 30일 이후에 가능합니다.',
            code: HttpStatus.BAD_REQUEST,
          });
        }
      }

      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ isActive: true })
        .where('email = :email', { email: newUser.email })
        .execute();

      const reactivatedUser = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.membership', 'membership')
        .where('user.email = :email', { email: newUser.email })
        .getOne();

      const { email, name, nickname, phoneNumber } = reactivatedUser as User;
      return {
        email,
        name,
        nickname,
        phoneNumber,
        membership: { name: (reactivatedUser as User).membership.name },
      };
    }

    // 기가입자인 경우 중복유저 처리
    if (duplicatedUser) {
      throw new BadRequestException({
        message: '이미 가입된 메일입니다.',
        code: HttpStatus.BAD_REQUEST,
      });
    }

    const hashedPassword = await hashPassword(newUser.password);

    // 멤버십과 연결
    const freeMembership = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.name = :name', { name: 'free' })
      .getOne();

    // 최대 100번 랜덤닉네임 생성 시도.
    const nickName = await this.generateUniqueNickName();

    const insertResult = await this.userRepository
      .createQueryBuilder('user')
      .insert()
      .into(User)
      .values({
        email: newUser.email,
        password: hashedPassword,
        name: newUser.name,
        nickname: nickName,
        gender: newUser.gender,
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
    const mailSubject = '[해우소] 이메일 인증 위한 인증코드를 발급해드립니다.';
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
      {
        isActive: false,
        deletedAt: new Date(),
      },
    );
    if (!updateResult.affected) {
      throw new NotFoundException('탈퇴에러');
    }
  }
}
