import { Injectable } from '@nestjs/common';
import { CreateRestroomDto } from './dto/create-restroom.dto';
// import { UpdateRestroomDto } from './dto/update-restroom.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Restroom } from './entities/restroom.entity';

@Injectable()
export class RestroomsService {
  constructor(
    @InjectRepository(Restroom)
    private readonly restroomRepository: Repository<Restroom>,
  ) {}

  async createRestRoomWithQB(
    createRestroomDto: CreateRestroomDto,
  ): Promise<Restroom> {
    const { name, lat, lng, addr } = createRestroomDto;

    const result = await this.restroomRepository
      .createQueryBuilder()
      .insert()
      .into(Restroom)
      .values({ name, lat, lng, addr })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async create(createRestroomDto: CreateRestroomDto) {
    return await this.createRestRoomWithQB(createRestroomDto);
  }

  async findAllWithQueryBuilder(): Promise<Restroom[]> {
    return this.restroomRepository
      .createQueryBuilder('restroom')
      .select(['restroom.id', 'restroom.lat', 'restroom.lng', 'restroom.addr'])
      .getMany();
  }

  async findAll() {
    return await this.findAllWithQueryBuilder();
  }

  findOne(id: number) {
    return `This action returns a #${id} restroom`;
  }

  // update(id: number, updateRestroomDto: UpdateRestroomDto) {
  //   return `This action updates a #${id} restroom`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} restroom`;
  // }
}
