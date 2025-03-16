import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { FindPlaceByParamDto } from './dto/findPlaceByParam.dto';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {
  }

  async create({ name, lat, lng, roadAddr, type }: CreatePlaceDto) {
    const result = await this.placeRepository
      .createQueryBuilder()
      .insert()
      .into(Place)
      .values({ name, lat, lng, roadAddr, type })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async findAll() {
    return await this.placeRepository
      .createQueryBuilder('place')
      .select(['place.id', 'place.name', 'place.lat', 'place.lng', 'place.roadAddr', 'place.type'])
      .getMany();
  }

  async findOneById(id: number) {
    return await this.placeRepository
      .createQueryBuilder('place')
      .where('place.id = :id', { id })
      .getOne();

  }

  async findPlacesByQuery(query: FindPlaceByParamDto) {
    const qb = this.placeRepository.createQueryBuilder('place');

    if (query.roadAddr) {
      qb.andWhere('place.roadAddr LIKE :roadAddr', { roadAddr: `%${query.roadAddr}%` });
    }
    if (query.name) {
      qb.andWhere('place.name LIKE :name', { name: query.name });
    }
    const places = await qb.getMany();
    return places;

  }

  async removePlaceById(id: number) {
    const result = await this.placeRepository
      .createQueryBuilder()
      .delete()
      .from(Place)
      .where('id = :id', { id })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`ID: ${id}에 해당하는 장소를 찾을 수 없습니다.`);
    }
  }


  // update(id: number, updateRestroomDto: UpdatePlaceDto) {
  //   return `This action updates a #${id} restroom`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} restroom`;
  // }
}
