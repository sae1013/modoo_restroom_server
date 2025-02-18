import { Module } from '@nestjs/common';
import { RestroomsService } from './restrooms.service';
import { RestroomsController } from './restrooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restroom } from './entities/restroom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restroom])],
  controllers: [RestroomsController],
  providers: [RestroomsService],
})
export class RestroomsModule {
}
