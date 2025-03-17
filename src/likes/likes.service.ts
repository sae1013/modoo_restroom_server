import { Inject, Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { RedisClientType } from 'redis';
import { DataSource } from 'typeorm';
@Injectable()
export class LikesService {
  constructor(
    @Inject('REDIS_CLIENT') redisClient: RedisClientType,
    private dataSource: DataSource,
  ) {}

  async like({ likeableId, likeableType }: CreateLikeDto) {
    // 꺼내서 확인한다.
    // TODO: 좋아요 카운트를 증가시킨다.x
    const qr = this.dataSource.createQueryRunner();
  }

  async dislike({ userEmail, likeableId, likeableType }: CreateLikeDto) {}

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
