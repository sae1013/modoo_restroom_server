import { User } from '../users/entities/user.entity';

// Express의 Request 인터페이스를 확장
declare global {
  namespace Express {
    interface Request {
      user?: User;
      // 필요하다면 다른 필드도 추가
    }
  }
}
