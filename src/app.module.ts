import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

import { PlacesModule } from './places/places.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MembershipModule } from './membership/membership.module';
import { RedisClientModuleModule } from './redis-client-module/redis-client-module.module';
import { CoolsmsModule } from './coolsms/coolsms.module';
import { GmailSmtpService } from './gmail-smtp/gmail-smtp.service';
import { GmailSmtpModule } from './gmail-smtp/gmail-smtp.module';
import { ReviewsModule } from './reviews/reviews.module';
import { LikesModule } from './likes/likes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    RedisClientModuleModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    MembershipModule,
    PlacesModule,
    ReviewsModule,
    CoolsmsModule,
    GmailSmtpModule,
    LikesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
