import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Place } from '../places/entities/place.entity';
import { CreateReviewWithPlaceDto } from './dto/createReviewWithPlace.dto';
import { RedisClientType } from 'redis';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private readonly dataSource: DataSource,
    @Inject('REDIS_CLIENT')
    private redisClient: RedisClientType,
  ) {
  }

  async create({
                 placeId,
                 rating,
                 content,
                 option1,
                 option2,
                 option3,
                 option4,
                 option5,
                 option6,
               }: CreateReviewWithPlaceDto, userId: number) {
    try {
      const result = await this.reviewRepository
        .createQueryBuilder()
        .insert()
        .into(Review)
        .values({
          content, rating, option1, option2, option3, option4, option5, option6,
          place: { id: placeId } as Place,
          user: { id: userId } as User,
        })
        .execute();

      return {
        result: {
          reviewId: result.identifiers[0].id,
          placeId: placeId,
        },
        message: '리뷰작성 성공',
        code: 200,
      };
    } catch (err) {
      throw new HttpException('Internal Server Error', 500);
    }

  }

  async createReviewWithPlace(createReviewWithPlaceDto: CreateReviewWithPlaceDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const {
      name,
      lat,
      lng,
      roadAddress,
      jibunAddress,
      content,
      rating,
      option1,
      option2,
      option3,
      option4,
      option5,
      option6,
    } = createReviewWithPlaceDto;
    try {
      let place = await queryRunner.manager.findOne(Place, {
        where: {
          name: createReviewWithPlaceDto.name,
        },
      });

      if (!place) {
        const geoJson = JSON.stringify({
          type: 'Point',
          coordinates: [lng, lat], // PostGIS에서는 일반적으로 [경도, 위도] 순서입니다.
        });
        place = queryRunner.manager.create(Place, {
          name,
          lat,
          lng,
          location: () => `ST_SetSRID(ST_GeomFromGeoJSON('${geoJson}'), 4326)`,
          roadAddr: roadAddress,
          jibunAddr: jibunAddress,
        });
        place = await queryRunner.manager.save(place);
      }

      // 리뷰 생성 시 place와 user를 FK에 저장.
      const review = queryRunner.manager.create(Review, {
        content: content,
        rating,
        option1,
        option2,
        option3,
        option4,
        option5,
        option6,
        place: { id: place.id },
        user: { id: userId },
      });
      const savedReview = await queryRunner.manager.save(review);

      await queryRunner.commitTransaction();
      return {
        result: { reviewId: savedReview.id, placeId: place.id },
        code: 200,
        message: '리뷰작성 성공',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all reviews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }

}
