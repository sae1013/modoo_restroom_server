import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt.auth.guard';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/private')
  PriavteHello(@Req() req: Request): string {
    return this.appService.getHello();
  }

  @Get('/public')
  PublicHello(): string {
    return this.appService.getHello();
  }
}
