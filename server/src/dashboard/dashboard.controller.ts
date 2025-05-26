import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  @Get()
  getDashboard(@Req() req) {
    const user = req.user;

    if (user.role === 'psychologist' && user.status === 'approved') {
      return this.getPsychDashboard(user);
    }

    if (user.role === 'user' && user.status === 'approved') {
      return this.getUserDashboard(user);
    }

    if (user.role === 'admin' && user.status === 'approved') {
      return this.getAdminDashboard(user);
    }

    return { message: 'Invalid role' };
  }

  private getUserDashboard(user) {
    return { message: `User dashboard for ${user.email}` };
  }

  private getPsychDashboard(user) {
    return { message: `Psychologist dashboard for ${user.email}` };
  }

  private getAdminDashboard(user) {
    return { message: `Admin dashboard for ${user.email}` };
  }
}
