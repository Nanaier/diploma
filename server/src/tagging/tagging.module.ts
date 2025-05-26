import { Module } from '@nestjs/common';
import { TaggingService } from './tagging.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TaggingService],
  exports: [TaggingService],
  controllers: [],
})
export class TaggingModule {}
