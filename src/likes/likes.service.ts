import { Inject, Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { RedisClientType } from 'redis';
import { DataSource, Like, Repository } from 'typeorm';
import { Place } from '../places/entities/place.entity';
import { Review } from '../reviews/entities/review.entity';
import { LikeableType } from './entities/like.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LikesService {
  constructor(
    @Inject('REDIS_CLIENT') redisClient: RedisClientType,
    private dataSource: DataSource,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async toggleLikePlace(
    user,
    { likeableId, likeableType, flag }: CreateLikeDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // UPSERT: 만약 (user, placeId, 'PLACE') 조합의 좋아요 기록이 없으면 삽입, 있으면 flag를 토글
      // INSERT ... ON CONFLICT 문을 사용합니다.
      // 반환되는 flag 값으로 좋아요 상태를 파악합니다.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const upsertResult = await queryRunner.query(
        `
        INSERT INTO "like" ("userId", "likeableId", "likeableType", "flag", "createdAt")
        VALUES ($1, $2, $3, 1, NOW())
        ON CONFLICT ("userId", "likeableId", "likeableType")
        DO UPDATE SET "flag" = CASE WHEN "like"."flag" = 1 THEN 0 ELSE 1 END,
                          "createdAt" = NOW()
        RETURNING "flag"
        `,
        [user.id, placeId, LikeableType.PLACE],
      );

      // upsertResult[0].flag가 새롭게 설정된 flag 값입니다.
      // delta 계산: flag가 1이면 좋아요 활성화이므로 카운트 +1, 0이면 좋아요 취소이므로 카운트 -1
      const newFlag = upsertResult[0].flag;
      const delta = newFlag === 1 ? 1 : -1;

      // Place의 likeCount 업데이트
      await queryRunner.query(
        `
        UPDATE "place"
        SET "likeCount" = "likeCount" + $1
        WHERE "id" = $2
        `,
        [delta, placeId],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 후기/장소에대한 좋아요 리스트
  async findAllByLikeableType(email: string, likeableType: LikeableType) {
    const results = await this.likeRepository
      .createQueryBuilder('like')
      .innerJoin('like.user', 'user')
      .where('user.email = :email', { email })
      .andWhere('like.likeableType = :likeableType', {
        likeableType: likeableType,
      })
      .andWhere('like.flag = :flag', { flag: 1 })
      .orderBy('like.createdAt', 'DESC')
      .getMany();

    return results;
  }
}
