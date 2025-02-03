import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

import { RestroomsModule } from './restrooms/restrooms.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, RestroomsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
