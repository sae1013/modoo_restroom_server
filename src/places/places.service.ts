// @ts-ignore
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { FindPlaceByParamDto } from './dto/findPlaceByParam.dto';
import { RedisClientType } from 'redis';


@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @Inject('REDIS_CLIENT')
    private redisClient: RedisClientType,
  ) {
  }

  async create({ name, lat, lng, roadAddr, jibunAddr, type }: CreatePlaceDto) {

    const geoJson = JSON.stringify({
      type: 'Point',
      coordinates: [lng, lat], // PostGIS에서는 일반적으로 [경도, 위도] 순서입니다.
    });

    const result = await this.placeRepository
      .createQueryBuilder()
      .insert()
      .into(Place)
      .values({
        name,
        lat,
        lng,
        location: () => `ST_SetSRID(ST_GeomFromGeoJSON('${geoJson}'), 4326)`,
        roadAddr,
        jibunAddr,
        type,
      })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async findAll() {
    return await this.placeRepository
      .createQueryBuilder('place')
      .select(['place.id', 'place.name', 'place.lat', 'place.lng', 'place.roadAddr', 'place.jibunAddr', 'place.type'])
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

  // REDIS
  async cacheAllPlaces() {
    const geoKey = 'places';
    const places = await this.placeRepository.find();
    if (!places.length) {
      console.log('No places found to cache.');
      return;
    }
    const multi = this.redisClient.multi();

    places.forEach((place) => {
      // Redis GEOADD 명령어는 longitude, latitude, 그리고 멤버(member) 문자열을 저장합니다.
      multi.geoAdd(geoKey, {
        longitude: place.lng,
        latitude: place.lat,
        member: place.id.toString(),
      });
    });

    const results = await multi.exec();
    return { results: results, message: '장소:레디스 업로드 성공', code: 200 };
  }

  async getPlacesCache(query) {
    const { latitude, longitude, radius } = query;
    const geoKey = 'places';
    // GEO 인덱스에 저장된 모든 멤버(Place id)를 ZRANGE로 가져옵니다.
    if (!latitude || !longitude || !radius) {
      const memberIds = await this.redisClient.zRange(geoKey, 0, -1);
      // 각 멤버의 좌표를 조회합니다.
      const positions = await this.redisClient.geoPos(geoKey, memberIds);
      // 결과를 id와 좌표로 매핑합니다.
      const places = memberIds.map((id, index) => ({
        id,
        position: positions[index], // positions[index]는 [longitude, latitude] 배열 형태
      }));

      return places;
    }

    const placeIds: string[] = await this.redisClient.geoSearch(
      geoKey,                             // GEO 인덱스의 키 (예: "places")
      { longitude, latitude },            // 기준 좌표 객체
      { radius, unit: 'm' },
    );
    return placeIds;
  }

  // update(id: number, updateRestroomDto: UpdatePlaceDto) {
  //   return `This action updates a #${id} restroom`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} restroom`;
  // }
}
