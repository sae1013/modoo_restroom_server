import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

import { RestroomsModule } from './restrooms/restrooms.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MembershipModule } from './membership/membership.module';
import { RedisClientModuleModule } from './redis-client-module/redis-client-module.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    RedisClientModuleModule,
    DatabaseModule,
    RestroomsModule,
    MembershipModule,
    UsersModule,
    AuthModule,
    RedisClientModuleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
