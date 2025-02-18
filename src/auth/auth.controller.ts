import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express-session';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('login')
  async login(@Body() body: { email: string, password: string }, @Req() req: Request) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      req.session.email = user.email;
      return { message: '로그인 성공' };
    } catch (error) {
      throw new UnauthorizedException('로그인 실패');
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async profile(@Req() req: Request) {
    const userProfile = await this.authService.getUserProfile(req.session.user.email);
    return { user: userProfile };
  }

  // 로그아웃 엔드포인트: 세션을 삭제
  @Post('logout')
  logout(@Req() req: Request) {
    req.session.destroy(err => {
      if (err) {
        console.error('세션 삭제 오류', err);
      }
    });
    return { message: '로그아웃 성공' };
  }
}
