import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';

// 커스텀 토큰 추출 함수: 쿠키에서 access_token 키를 사용해 JWT를 추출
const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject()
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') as string,
    });
  }

  // Guard를 사용하고, JWT 인증에 성공하면 return 값을 req에 박아서 넘겨준다.
  // redis에서 값을 읽으면되긴함...
  async validate(payload: any) {
    const user = await this.usersService.getUserProfileByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
