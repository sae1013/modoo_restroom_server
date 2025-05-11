import { HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  async findReviewsByPlaceId(placeId: number) {
    // 1. 리뷰와 연관된 user 데이터를 함께 조회합니다.
    const reviews = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.placeId = :placeId', { placeId })
      .getMany();

    // 2. 해당 장소의 전체 리뷰 개수와 평균 rating을 계산합니다.
    const rawResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COUNT(*)', 'reviewCount')
      .addSelect('AVG(review.rating)', 'ratingAvg')
      .where('review.placeId = :placeId', { placeId })
      .getRawOne();

    // 3. 조회된 리뷰에서 user id 목록을 추출합니다.
    const userIds = Array.from(
      new Set(reviews.map(review => review.user.id)),
    );

    // 4. 해당 user들이 작성한 전체 리뷰 개수를 구합니다.
    // (user 별로 GROUP BY를 이용하여 집계)
    const userReviewCountsRaw = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('review.userId IN (:...userIds)', { userIds })
      .groupBy('review.userId')
      .getRawMany();

    // userReviewCountsRaw는 예를 들어 [ { userId: '1', count: '5' }, { userId: '2', count: '3' }, ... ]
    // 키를 userId로 하는 맵으로 변환합니다.
    const userReviewCountMap = userReviewCountsRaw.reduce<Record<number, number>>((acc, cur) => {
      // DB에서 count, userId는 string일 수 있으므로 Number()로 변환
      acc[Number(cur.userId)] = Number(cur.count);
      return acc;
    }, {});

    // 5. 각 review의 user 객체에 reviewCount 필드를 추가합니다.
    const reviewsWithUserCount = reviews.map(review => {
      // user 정보 중 제외할 필드를 빼고 나머지 값을 sanitizedUser에 담습니다.
      const { password, createdAt, updatedAt, phoneNumber, admin, ...sanitizedUser } = review.user;
      return {
        ...review,
        user: {
          ...sanitizedUser,
          reviewCount: userReviewCountMap[review.user.id] || 0,
        },
      };
    });

    return {
      reviews: reviewsWithUserCount,
      reviewCount: Number(rawResult.reviewCount),
      ratingAvg: Number(rawResult.ratingAvg),
    };
  }

  findReviewsByUserId(userId: number) {

    return this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.place', 'place')
      .leftJoinAndSelect('review.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  async remove(id: number) {
    const result = await this.reviewRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('리뷰삭제에 실패했습니다');
    }
    return {
      result: { reviewId: id },
      message: '리뷰 삭제 성공',
      code: 200,
    };
  }

}
