import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    email: string;
    // 필요에 따라 추가 필드를 정의할 수 있습니다.
  };
}

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createLikeDto: CreateLikeDto, @Req() req: Request) {
    return this.likesService.toggleLikePlace(req.user, createLikeDto);
  }

  @Get()
  findAllLikeByUser(
    @Req() req: RequestWithUser,
    @Query() query: Record<string, any>,
  ) {
    return this.likesService.findAllByLikeableType(
      req.user.email || '',
      query?.likeableType,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.likesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
  //   return this.likesService.update(+id, updateLikeDto);
  // }
}
