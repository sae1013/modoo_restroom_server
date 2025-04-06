import {
  Controller,
  Get,
  Post,
  Body,
  Param, Query,
  Delete,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { FindPlaceByParamDto } from './dto/findPlaceByParam.dto';
import { FindPlaceByGeolocationDto } from './dto/FindPlaceByGeolocation.dto';
import { GetPlacesCacheDto } from '../reviews/dto/getPlacesCacheDto.dto';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {
  }

  @Post()
  async create(@Body() createPlaceDto: CreatePlaceDto) {
    return this.placesService.create(createPlaceDto);
  }

  @Get()
  async findPlaces(@Query() query: FindPlaceByParamDto) {
    if (!query.roadAddr && !query.name) {
      return this.placesService.findAll();
    }
    return this.placesService.findPlacesByQuery(query);
  }

  @Get('geolocation')
  async findPlacesByGeolocation(@Query() { sw_lat, sw_lng, ne_lat, ne_lng }: FindPlaceByGeolocationDto) {
    return this.placesService.findPlacesWithinBoundingBox(sw_lat, sw_lng, ne_lat, ne_lng);
  }

  @Get('nearby')
  async findPlacesByNearBy(@Query() { lat, lng, radius }) {
    return this.placesService.findPlacesWithinRadius(lat, lng, radius);
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.placesService.findOneById(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.placesService.removePlaceById(+id);
  }

  @Post('/redis/upload')
  cachePlaces() {
    return this.placesService.cacheAllPlaces();
  }

  @Get('/redis/get')
  getPlacesCache(@Query() query: GetPlacesCacheDto) {
    return this.placesService.getPlacesCache(query);
  }
}
