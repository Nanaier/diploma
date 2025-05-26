import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('register-psychologist')
  registerPsychologist(@Body() dto: RegisterDto) {
    return this.auth.registerPsychologist(dto);
  }

  @Post('verify-token')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Req() req: Request) {
    return {
      valid: true,
      user: req.user,
    };
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    const user = req.user as any; // Set by JwtStrategy's validate()
    return this.auth.getMe(user.id);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMyAccount(@Req() req: Request) {
    const user = req.user as any;
    return this.auth.deleteMe(user.id);
  }
}
