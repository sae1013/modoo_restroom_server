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

  // QueryBuilder
  async createRestRoomWithQB(
    createRestroomDto: CreateRestroomDto,
  ): Promise<Restroom | null> {
    const { name, lat, lng } = createRestroomDto;
  }
  create(createRestroomDto: CreateRestroomDto) {
    return 'This action adds a new restroom';
  }

  findAll() {
    return `This action returns all restrooms`;
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
