import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('psychologists')
  async findBestMatch(@Req() req) {
    return this.matchingService.findBestMatch(Number(req.user.id));
  }

  @Get('exercises')
  async findBestExerciseMatch(@Req() req) {
    return this.matchingService.findBestExerciseMatch(Number(req.user.id));
  }
}
