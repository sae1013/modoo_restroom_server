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
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  /**
   * 사용자 로그인 API_101
   */
  @Post('login')
  @ApiBody({
    description: '사용자 로그인 요청 데이터',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'sae1013@gmail.com' },
        password: { type: 'string', example: 'qweqrdf1234124' },
      },
    },
  })
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
      console.log('herer');
      const token = await this.authService.login(user);
      /**
       * 서버측에서 쿠키를 박아서 내려줄 경우 클라에서 읽을 수 없어서 요청 응답으로 변경
       */
      // res.cookie('access_token', token, {
      //   httpOnly: false,
      //   maxAge: 24 * 60 * 60 * 1000,
      //   secure: false,
      //   sameSite: 'lax',
      // });
      return { result: token, mesasge: '로그인 성공', code: 200 };
    } catch (error) {
      throw new UnauthorizedException('로그인 실패');
    }
  }

  /**
   * 사용자 로그아웃 API_102
   */
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Req() req) {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader.split(' ')[1];
    return this.authService.logout(accessToken);
  }

  /**
   * SMS 인증번호 요청 API_103
   */
  @Post('/sms/request')
  async requestAuthCode(@Body() requestAuthCodeDto: RequestAuthCodeDto) {
    await this.authService.requestAuthCode(requestAuthCodeDto);
    return { status: 200 };
    //
    // naver SMS에 인증번호 요청.
  }

  /**
   * SMS 핸드폰 번호인증(인증코드 확인) API_104
   */
  @Post('/sms/verify')
  async authenticateSms(@Body() authenticateSmsDto: AuthenticateSmsDto) {
    await this.authService.authenticateSmsCode(authenticateSmsDto);
    return { status: 200 };
  }
}
