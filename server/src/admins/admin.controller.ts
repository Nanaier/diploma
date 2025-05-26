// admin.controller.ts
import { Controller, Get, Post, UseGuards, Body, Param } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { S3Service } from 'src/aws/s3.service';
import { TaggingService } from 'src/tagging/tagging.service';

@Controller('admin/psychologists')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private taggingService: TaggingService,
  ) {}

  @Get('pending')
  async getPendingPsychologists() {
    const psychologists = await this.prisma.psychologist.findMany({
      where: { approved: false },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    // Generate signed URLs for each psychologist
    const psychologistsWithUrls = await Promise.all(
      psychologists.map(async (psych) => {
        const [avatarUrl, certUrl] = await Promise.all([
          psych.avatarUrl ? this.s3Service.getFileUrl(psych.avatarUrl) : null,
          psych.certUrl ? this.s3Service.getFileUrl(psych.certUrl) : null,
        ]);

        return {
          ...psych,
          avatarUrl,
          certUrl,
        };
      }),
    );

    return psychologistsWithUrls;
  }

  @Post(':id/approve')
  async approvePsychologist(@Param('id') id: string) {
    const psychologistId = parseInt(id);

    return this.prisma.$transaction(async (tx) => {
      // 1. Get the user ID associated with this psychologist
      const psychologist = await tx.psychologist.findUnique({
        where: { id: psychologistId },
        select: { userId: true, description: true, specialty: true },
      });

      if (!psychologist) {
        throw new Error('Psychologist not found');
      }

      // 2. Update both psychologist and user records
      await tx.psychologist.update({
        where: { id: psychologistId },
        data: { approved: true },
      });

      await tx.user.update({
        where: { id: psychologist.userId },
        data: { status: 'approved' },
      });

      const textToProcess = `${psychologist.description} ${psychologist.specialty || ''}`;
      await this.taggingService.processPsychologistTags(
        psychologistId,
        textToProcess,
      );

      return { success: true };
    });
  }

  @Post(':id/reject')
  async rejectPsychologist(@Param('id') id: string) {
    const psychologistId = parseInt(id);

    return this.prisma.$transaction(async (tx) => {
      // 1. Get the user ID associated with this psychologist
      const psychologist = await tx.psychologist.findUnique({
        where: { id: psychologistId },
        select: { userId: true },
      });

      if (!psychologist) {
        throw new Error('Psychologist not found');
      }

      // 2. Delete the psychologist record
      await tx.psychologist.delete({
        where: { id: psychologistId },
      });

      // 3. Update the user status to rejected
      await tx.user.update({
        where: { id: psychologist.userId },
        data: {
          status: 'rejected',
          // Optionally, you could add the reason to the user record
          // psychologistRejectionReason: reason
        },
      });

      // 4. (Optional) Send rejection email with reason
      // await this.mailService.sendRejectionEmail(psychologist.userId, reason);

      return { success: true };
    });
  }
}
