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

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.placesService.findOneById(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.placesService.removePlaceById(+id);
  }
}
