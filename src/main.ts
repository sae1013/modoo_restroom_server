import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import * as session from 'express-session';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true, // 클라이언트와 서버 간 쿠키 전송 허용
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.use(
    session({
      name: 'X-Token',// 클라이언트 쿠키 이름
      secret: configService.get('SESSION_PWD'),
      resave: false,
      secure: false, // http 통신에서는 쿠키를 자동으로 저장할 수 있도록
      httpOnly: true,
      saveUninitialized: false,
      sameSite: 'lax',
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
      },
      rolling: true,
    }),
  );
  await app.listen(configService.get('WAS_PORT') ?? 8001);
}

bootstrap();
