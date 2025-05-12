import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user-dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { Request, Response } from 'express';
import { RequestPasswordResetVerificationCodeDto } from './dto/request-password-verification.dto';
import { VerifyPasswordResetDto } from './dto/verify-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 회원가입 API_201
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /*
   * 회원탈퇴 API_202
   */
  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(@Req() req) {
    this.usersService.remove(req.user?.id);
    return {
      result: null,
      message: '탈퇴성공',
      status: HttpStatus.OK,
    };
  }

  /**
   * 이메일로 회원조회 API_203
   */
  // @UseGuards(JwtAuthGuard)
  @Get('/profile/email/:email')
  async getUserProfile(@Req() req: Request, @Param('email') email: string) {
    const userProfile = await this.usersService.getUserProfileByEmail(email);
    return userProfile;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // 비밀번호 재설정 -> 본인의 이메일 주소 입력-> verifycode전송
  // 인증번호 검증 -> 성공
  // 비밀번호 생성

  /**
   * 비밀번호 재설정 요청 생성 API_204
   */
  @Post('/password-reset')
  async requestPasswordResetVerificationCode(
    @Body()
    requestPasswordResetVerificationCodeDto: RequestPasswordResetVerificationCodeDto,
  ) {
    await this.usersService.requestPasswordResetVerificationCode(
      requestPasswordResetVerificationCodeDto,
    );
    return {
      status: 200,
    };
  }

  // DTO 필요.
  /**
   * 비밀번호 재설정 인증코드 검증 API_205
   */
  @Post('/password-reset/verify-code')
  async passwordResetVerifyCode(
    @Body() verifyPasswordResetDto: VerifyPasswordResetDto,
  ) {
    await this.usersService.passwordResetVerifyCode(verifyPasswordResetDto);
    return {
      status: 200,
    };
  }

  // DTO 필요
  /**
   * 인증 후 비밀번호 재설정 (API_206)
   */
  @Patch('/pasword-reset')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.usersService.resetPassword(resetPasswordDto);
    return {
      status: 200,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Req() req) {
    const userId = req.user.id;
    const user = await this.usersService.getUserProfile(userId);
    return {
      result: user,
      code: HttpStatus.OK,
      message: '조회성공',
    };
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }
}
