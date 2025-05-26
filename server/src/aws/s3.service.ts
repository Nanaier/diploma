// src/aws/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(params: {
    Bucket: string;
    Key: string;
    Body: Buffer;
    ContentType: string;
  }) {
    return this.s3.upload(params).promise();
  }

  async getFileUrl(key: string) {
    return await this.s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 3600, // URL буде дійсний 1 годину
    });
  }
}
