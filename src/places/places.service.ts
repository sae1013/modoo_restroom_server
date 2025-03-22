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

    const geoJson = JSON.stringify({
      type: 'Point',
      coordinates: [lng, lat], // PostGIS에서는 일반적으로 [경도, 위도] 순서입니다.
    });

    const result = await this.placeRepository
      .createQueryBuilder()
      .insert()
      .into(Place)
      .values({ name, lat, lng, location: () => `ST_SetSRID(ST_GeomFromGeoJSON('${geoJson}'), 4326)`, roadAddr, type })
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

  /**
   * 남서(SW)와 북동(NE) 좌표로 정의된 바운딩 박스 내의 장소들을 조회합니다.
   * @param sw_lat - 남서쪽 위도
   * @param sw_lng - 남서쪽 경도
   * @param ne_lat - 북동쪽 위도
   * @param ne_lng - 북동쪽 경도
   */
  async findPlacesWithinBoundingBox(sw_lat, sw_lng, ne_lat, ne_lng) {
    console.log(sw_lat, sw_lng, ne_lat, ne_lng);
    return await this.placeRepository
      .createQueryBuilder('place')
      .where(
        `ST_Within(
          place.location,
          ST_MakeEnvelope(:sw_lng, :sw_lat, :ne_lng, :ne_lat, 4326)
        )`,
        { sw_lng, sw_lat, ne_lng, ne_lat },
      )
      .getMany();
  }

  /**
   *
   * @param lat
   * @param lng
   * @param radius 단위:meter
   */
  async findPlacesWithinRadius(lat: number, lng: number, radius: number = 5000): Promise<Place[]> {
    return await this.placeRepository
      .createQueryBuilder('place')
      .where(
        `ST_DWithin(
        place.location::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        :radius
      )`,
        { lat, lng, radius },
      )
      .orderBy(
        `ST_Distance(
        place.location::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
      )`,
        'ASC',
      )
      .getMany();
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
