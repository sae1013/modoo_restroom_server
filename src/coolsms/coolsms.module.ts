// coolsms.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoolsmsService } from './coolsms.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [CoolsmsService],
  exports: [CoolsmsService],
})
export class CoolsmsModule {
}
