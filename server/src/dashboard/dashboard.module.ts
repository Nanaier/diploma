import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [DashboardController],
})
export class DashboardModule {}
