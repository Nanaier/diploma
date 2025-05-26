import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';

@Module({
  imports: [PrismaModule],
  providers: [AvailabilityService],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}
