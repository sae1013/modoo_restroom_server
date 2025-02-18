import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt.auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @UseGuards(JwtAuthGuard)
  @Get('/private')
  PriavtegetHello(): string {
    return this.appService.getHello();
  }

  @Get('/public')
  PublicgetHello(): string {
    return this.appService.getHello();
  }
}
