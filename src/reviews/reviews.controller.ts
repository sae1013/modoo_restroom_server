import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { CreateReviewWithPlaceDto } from './dto/createReviewWithPlace.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReviewWithPlace: CreateReviewWithPlaceDto, @Req() req) {
    const { placeId } = createReviewWithPlace;

    if (placeId > 0) {
      return this.reviewsService.create(createReviewWithPlace, req.user.id);
    }
    return this.reviewsService.createReviewWithPlace(createReviewWithPlace, req.user.id);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log('path', id);
    const { reviews, reviewCount, ratingAvg } = await this.reviewsService.findReviewsByPlaceId(+id);
    return {
      code: 200,
      message: '댓글 조회성공',
      result: { reviews, reviewCount, ratingAvg },
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}
