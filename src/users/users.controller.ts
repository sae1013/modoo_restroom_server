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
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestEmailAuthCodeDto, VerifyEmailAuthCodeDto } from './dto/auth-dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

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

  /**
   * 이메일 인증코드 발송
   */
  @Post('/email/request-authcode')
  async requestEmailAuthCode(@Body() { email }: RequestEmailAuthCodeDto) {
    await this.usersService.requestEmailAuthCode(email);
  }

  @Post('/email/verify-authcode')
  async verifyEmailAuthCode(@Body() { email, code }: VerifyEmailAuthCodeDto) {
    return await this.usersService.verifyEmailAuthCode(email, code);
  }

  /**
   * 비밀번호 새로 설정하기(비로그인상태)
   */
  @Patch('/reset/password')
  async resetPassword(@Body() { email, password }: ResetPasswordDto) {
    return await this.usersService.changePassword(email, password);
  }

  /**
   * 비밀번호 변경하기.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('/change/password')
  async changePassword(@Req() req, @Body() { password }: ChangePasswordDto) {
    return await this.usersService.changePassword(req.user?.email, password);
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


}
