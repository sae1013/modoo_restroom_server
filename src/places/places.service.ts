import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {
  }

  async createPlaceWithQB(
    createPlaceDto: CreatePlaceDto,
  ): Promise<Place> {
    const { name, lat, lng, addr } = createPlaceDto;

    const result = await this.placeRepository
      .createQueryBuilder()
      .insert()
      .into(Place)
      .values({ name, lat, lng, addr })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async create(createPlaceDto: CreatePlaceDto) {
    return await this.createPlaceWithQB(createPlaceDto);
  }

  async findAllWithQueryBuilder(): Promise<Place[]> {
    return this.placeRepository
      .createQueryBuilder('place')
      .select(['place.id', 'place.lat', 'place.lng', 'place.addr'])
      .getMany();
  }

  async findAll() {
    return await this.findAllWithQueryBuilder();
  }

  findOne(id: number) {
    return `This action returns a #${id} restroom`;
  }

  // update(id: number, updateRestroomDto: UpdatePlaceDto) {
  //   return `This action updates a #${id} restroom`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} restroom`;
  // }
}
