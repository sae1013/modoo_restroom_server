import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://192.168.219.118:3000',
      'http://192.168.219.102:3000',
      'http://192.168.219.128:3000',
      'http://192.168.219.125:3000',
      'http://172.23.243.9:3000',
    ],
    credentials: true, // 클라이언트와 서버 간 쿠키 전송 허용
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Swagger 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('해우소 백엔드')
    .setDescription('Nest JS Swagger API Doc')
    .setVersion('1.0')
    // 커스텀 JWT 토큰 apiKey 스키마 추가
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access_token',
    )

    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const customOptions = {
    persistAuthorization: true,
    swaggerOptions: {
      authAction: {
        access_token: {
          name: 'access_token',
          schema: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          value:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic2FlMTAxM0BnbWFpbC5jb20iLCJpYXQiOjE3NDYyNzY0NTksImV4cCI6MTc0ODM1MDA1OX0.RKdjp5eDz5GxD-aQo4TgJk5jKULoJjJ10UqnNcC9KHo',
        },
      },
      requestInterceptor: (req) => {
        if (!req.headers.Authorization) {
          req.headers.Authorization =
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic2FlMTAxM0BnbWFpbC5jb20iLCJpYXQiOjE3NDYyNzY0NTksImV4cCI6MTc0ODM1MDA1OX0.RKdjp5eDz5GxD-aQo4TgJk5jKULoJjJ10UqnNcC9KHo';
        }
        return req;
      },
    },
  };

  SwaggerModule.setup('v1/swagger', app, document, customOptions);

  await app.listen(configService.get('WAS_PORT') ?? 8001);
}

bootstrap();
