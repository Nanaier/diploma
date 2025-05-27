import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { MoodService } from './mood.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // assuming you're using JWT

@Controller('mood')
@UseGuards(JwtAuthGuard)
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateMoodEntryDto) {
    return this.moodService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Req() req, @Query('userId') userIdQuery?: string) {
    const targetUserId = userIdQuery ? parseInt(userIdQuery) : req.user.id;
    return this.moodService.findAll(req.user, targetUserId);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    return this.moodService.findOne(Number(id), req.user.id);
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    return this.moodService.remove(Number(id), req.user.id);
  }
}
