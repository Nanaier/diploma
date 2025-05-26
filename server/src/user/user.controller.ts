import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRoleGuard } from 'src/auth/user-role.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('description')
  @UseGuards(UserRoleGuard)
  async update(@Body() dto: any, @Req() req) {
    return this.userService.updateDescription(+req.user.id, dto.description);
  }

  @Patch('psychologist/:id/shareData')
  @UseGuards(UserRoleGuard)
  async shareData(@Param('id') id: string, @Req() req) {
    return this.userService.shareData(+req.user.id, +id);
  }

  @Get(':id')
  async getUserInfo(@Param('id') id: string, @Req() req) {
    return this.userService.getUserInfo(+req.user.id, +id);
  }
}
