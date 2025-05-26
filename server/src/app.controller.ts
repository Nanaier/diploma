import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PrismaService } from 'prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(@Req() req) {
    return { message: `Hello ${req.user.email}`, user: req.user };
  }
}
