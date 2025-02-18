import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express-session';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (request.session && request.session.user) {
      const user = await this.authService.getUserProfile(request.session.user.email);
      if (!user) {
        throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다.');
      }
      (request as any).user = user;
      return true;
    }
    throw new UnauthorizedException('로그인이 필요합니다.');
  }
}