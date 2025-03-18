import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Membership } from '../membership/entities/membership.entity';
import { GmailSmtpModule } from '../gmail-smtp/gmail-smtp.module';
import { Like } from './entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {
}