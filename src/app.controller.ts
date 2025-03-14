import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt.auth.guard';
import { Request } from 'express';
import { CACHE_MANAGER, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              @Inject(CACHE_MANAGER)
              private cacheManager: Cache) {
  }

  @Get('/healthcheck')
  @CacheKey('healthCheck')
  @CacheTTL(100)
  async healthcheck() {
    const res = '응답캐시';
    const res2 = await this.cacheManager.set('gggggggggg', 'ggg', 3333333333);
    console.log(res2);

    return res;
  }


  @UseGuards(JwtAuthGuard)
  @Get('/private')
  PriavtegetHello(@Req() req: Request): string {
    return this.appService.getHello();
  }

  @Get('/public')
  PublicgetHello(): string {
    return this.appService.getHello();
  }

}
