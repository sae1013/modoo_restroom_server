import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RestroomsService } from './restrooms.service';
import { CreateRestroomDto } from './dto/create-restroom.dto';
import { UpdateRestroomDto } from './dto/update-restroom.dto';

@Controller('restrooms')
export class RestroomsController {
  constructor(private readonly restroomsService: RestroomsService) {
  }

  @Post('create')
  create(@Body() createRestroomDto: CreateRestroomDto) {
    return this.restroomsService.create(createRestroomDto);
  }

  @Get()
  findAll() {
    return this.restroomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restroomsService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRestroomDto: UpdateRestroomDto) {
  //   return this.restroomsService.update(+id, updateRestroomDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.restroomsService.remove(+id);
  // }
}
