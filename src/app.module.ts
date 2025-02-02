import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

import { RestroomsModule } from './restrooms/restrooms.module';

@Module({
  imports: [DatabaseModule, RestroomsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
