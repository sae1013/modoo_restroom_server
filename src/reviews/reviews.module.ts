import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { PlacesModule } from '../places/places.module';
import { Place } from '../places/entities/place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Place])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {
}
