import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [DashboardController],
})
export class DashboardModule {}
