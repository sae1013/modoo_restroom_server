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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user-dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { Request, Response } from 'express';
import { RequestPasswordResetVerificationCodeDto } from './dto/request-password-verification.dto';

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
  async remove() {
    this.usersService.remove();
    return {
      status: 200,
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
  // DTO 필요, 가입 시 입력한 메일주소를 작성해야함.
  @Post('/password-reset')
  async requestPasswordResetVerificationCode(@Body() requestPasswordResetVerificationCodeDto: RequestPasswordResetVerificationCodeDto) {
    this.usersService.requestPasswordResetVerificationCode(requestPasswordResetVerificationCodeDto);
  }

  // DTO 필요.
  /**
   * 비밀번호 재설정 인증코드 검증 API_205
   */
  @Post('/password-reset/verify-code')
  async passwordResetVerifyCode() {
    this.usersService.passwordResetVerifyCode();
    return {
      status: 200,
    };
  }

  // DTO 필요
  /**
   * 인증 후 비밀번호 재설정 (API_206)
   */
  @Patch('/pasword-reset')
  async resetPassword() {
    this.usersService.resetPassword();
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

}
