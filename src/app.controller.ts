import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { TestGuard } from './auth/guards/test.auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @UseGuards(TestGuard, AuthGuard)
  @Get('/private')
  PriavtegetHello(): string {
    return this.appService.getHello();
  }

  @Get('/public')
  PublicgetHello(): string {
    return this.appService.getHello();
  }
}
