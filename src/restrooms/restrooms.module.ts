import { Module } from '@nestjs/common';
import { RestroomsService } from './restrooms.service';
import { RestroomsController } from './restrooms.controller';

@Module({
  controllers: [RestroomsController],
  providers: [RestroomsService],
})
export class RestroomsModule {}
