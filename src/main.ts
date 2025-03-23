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
      'http://127.0.0.1:3001',
      'http://192.168.219.118:3000',
      'http://192.168.219.118:8081',
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
    .addApiKey(
      {
        type: 'apiKey',
        name: 'access_token',
        in: 'cookie',
      },
      'access_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const customOptions = {
    swaggerOptions: {
      authAction: {
        'access_token': {
          name: 'access_token',
          schema: {
            type: 'apiKey',
            in: 'cookie',
            name: 'access_token',
          },
          // 여기에 원하는 기본 토큰 값을 지정합니다.
          value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiaWF0IjoxNzQyNTcxNzA1LCJleHAiOjE3NDQ2NDUzMDV9.pHHwj4U3oZEQCoQ9SkaFlxfbGBDtWhgdgKoG1H69zO0',
        },
      },
    },
  };

  SwaggerModule.setup('v1/swagger', app, document, customOptions);

  await app.listen(configService.get('WAS_PORT') ?? 8001);
}

bootstrap();
