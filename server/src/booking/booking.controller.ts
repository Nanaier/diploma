import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRoleGuard } from 'src/auth/user-role.guard';

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  @UseGuards(UserRoleGuard)
  async createBooking(
    @Body() body: { psychologistId: number; startTime: Date; endTime: Date },
    @Req() req,
  ) {
    return this.bookingService.createBooking(
      parseInt(req.user.id),
      body.psychologistId,
      new Date(body.startTime),
      new Date(body.endTime),
    );
  }

  @Get('my')
  async getMyBookings(@Req() req) {
    return this.bookingService.getUserBookings(parseInt(req.user.id));
  }

  @Get('psychologist')
  async getPsychologistBookings(@Req() req) {
    return this.bookingService.getBookingsForPsychologist(
      parseInt(req.user.id),
    );
  }

  @Get('psychologist/:id/availability')
  async getPsychologistAvailability(@Param('id') id: string) {
    return this.bookingService.getPsychologistAvailableSlots(parseInt(id));
  }

  //   @Post(':id/confirm')
  //   async confirmBooking(@Param('id') id: string, @Req() req) {
  //     return this.bookingService.confirmBooking(
  //       parseInt(id),
  //       parseInt(req.user.id),
  //     );
  //   }

  //   @Post(':id/reject')
  //   async rejectBooking(@Param('id') id: string, @Req() req) {
  //     return this.bookingService.rejectBooking(
  //       parseInt(id),
  //       parseInt(req.user.id),
  //     );
  //   }
}
