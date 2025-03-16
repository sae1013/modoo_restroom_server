import { Module } from '@nestjs/common';
import { GmailSmtpService } from './gmail-smtp.service';

@Module({
  imports: [],
  providers: [
    GmailSmtpService,
  ],
  exports: [GmailSmtpService],
})
export class GmailSmtpModule {
}

