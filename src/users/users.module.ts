import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Membership } from '../membership/entities/membership.entity';
import { GmailSmtpModule } from '../gmail-smtp/gmail-smtp.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Membership]), GmailSmtpModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {
}


