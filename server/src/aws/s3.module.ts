import { Module } from '@nestjs/common';
import { S3Service } from 'src/aws/s3.service';

@Module({
  exports: [S3Service],
  providers: [S3Service],
})
export class S3Module {}
