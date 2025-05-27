import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TaggingModule } from 'src/tagging/tagging.module';

@Module({
  imports: [PrismaModule, TaggingModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
