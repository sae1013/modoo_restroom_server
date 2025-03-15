import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { User } from '../users/entities/user.entity';
import { RequestAuthCodeDto } from './dto/request-auth-code.dto';
import { AuthenticateSmsDto } from './dto/authenticate-sms.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  /**
   * 사용자 로그인 API_101
   */
  @Post('login')
  async login(
    @Body()
    body: {
      email: string;
      password: string;
    },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user: Omit<User, 'password'> = await this.authService.validateUser(
        body.email,
        body.password,
      );
      const token = await this.authService.login(user);
      res.cookie('access_token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        sameSite: 'lax',
      });
      return { message: '로그인 성공' };
    } catch (error) {
      throw new UnauthorizedException('로그인 실패');
    }
  }

  /**
   * 사용자 로그아웃 API_102
   */
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout() {}

  /**
   * SMS 인증번호 요청 API_103
   */
  @Post('/sms/request')
  async requestAuthCode(@Body() requestAuthCodeDto: RequestAuthCodeDto) {
    const authCode = await this.authService.requestAuthCode(requestAuthCodeDto);
    return { authCode };
    //
    // naver SMS에 인증번호 요청.
  }

  /**
   * SMS 핸드폰 번호인증(인증코드 확인) API_104
   */
  @Post('/sms')
  async authenticateSms(@Body() authenticateSmsDto: AuthenticateSmsDto) {
    await this.authService.authenticateSmsCode(authenticateSmsDto);
  }
}
