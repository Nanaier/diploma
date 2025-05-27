// psychologist.controller.ts

import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  UseInterceptors,
  Body,
  Query,
  Param,
  Delete,
  HttpCode,
  UploadedFiles,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PsychologistService } from './psychologist.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetPsychologistsDto } from './dto/get-psychologists.dto';

@Controller('psychologist')
export class PsychologistController {
  constructor(private psychologistService: PsychologistService) {}

  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'certification', maxCount: 1 },
      { name: 'avatar', maxCount: 1 },
    ]),
  )
  async completeProfile(
    @UploadedFiles()
    files: {
      certification: Express.Multer.File[];
      avatar: Express.Multer.File[];
    },
    @Body()
    body: {
      description: string;
      specialty: string;
      phoneNumber: string;
    },
    @Req() req,
  ) {
    return this.psychologistService.completeProfile(
      parseInt(req.user.id),
      body.description,
      body.specialty,
      body.phoneNumber,
      files.certification?.[0],
      files.avatar?.[0],
    );
  }

  @Get('approved')
  @UseGuards(JwtAuthGuard)
  async getApprovedPsychologists(@Query() query: GetPsychologistsDto) {
    console.log(query);
    const { page = 1, limit = 10, search = '' } = query;

    return this.psychologistService.getApprovedPsychologistsPaginated(
      Number(page),
      Number(limit),
      search,
    );
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getUsersAssignedToPsychologist(@Req() req) {
    return this.psychologistService.getUsersAssignedToPsychologist(
      Number(req.user.id),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPsychologistProfile(@Param('id') id: string) {
    return this.psychologistService.getPsychologistById(parseInt(id));
  }

  @Delete('unassign/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async unassignUser(@Req() req, @Param('userId') userId: string) {
    return this.psychologistService.unassignUser(
      Number(req.user.id),
      Number(userId),
    );
  }

  @Delete('user/unassign/:psychId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async unassignPsych(@Req() req, @Param('psychId') psychId: string) {
    return this.psychologistService.unassignPsych(
      Number(req.user.id),
      Number(psychId),
    );
  }
}
