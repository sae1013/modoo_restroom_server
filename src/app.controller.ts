import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt.auth.guard';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              @Inject(CACHE_MANAGER)
              private cacheManager: Cache) {
  }

  // @UseGuards(JwtAuthGuard)
  @Get('/ping')
  async redisPingTest() {
    console.log('✅ CACHE_MANAGER Injected:', this.cacheManager ? 'OK' : 'FAIL');
    const res = await this.cacheManager.get('test');
    console.log(res);


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
