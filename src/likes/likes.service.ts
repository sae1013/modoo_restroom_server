import { Inject, Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { RedisClientType } from 'redis';
import { DataSource, Like } from 'typeorm';
import { Place } from '../places/entities/place.entity';
import { Review } from '../reviews/entities/review.entity';
import { LikeableType } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @Inject('REDIS_CLIENT') redisClient: RedisClientType,
    private dataSource: DataSource,
  ) {
  }

  async like(user, { likeableId, likeableType }: CreateLikeDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();


  }


  findAll() {
    return `This action returns all likes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} like`;
  }

  update(id: number, updateLikeDto: UpdateLikeDto) {
    return `This action updates a #${id} like`;
  }

  remove(id: number) {
    return `This action removes a #${id} like`;
  }
}
