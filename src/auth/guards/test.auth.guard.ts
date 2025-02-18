// 테스트용으로 세션에 강제로 user 정보를 삽입합니다.
// 실제 프로덕션 코드에서는 제외

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express-session';

@Injectable()
export class TestGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();


    if (!request.session.user) {
      request.session.user = {
        email: 'sae1013@gmail.com',
      };
      console.info('TestGuard: user set in session', request.session.user);
    }

    return true; // 다음 가드나 컨트롤러로 요청 진행
  }
}