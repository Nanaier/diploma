// psychologist.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { S3Service } from 'src/aws/s3.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class PsychologistService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private s3Service: S3Service,
  ) {}

  async completeProfile(
    userId: number,
    description: string,
    specialty: string,
    phoneNumber: string,
    certificationFile: Express.Multer.File,
    avatarFile: Express.Multer.File,
  ) {
    console.log(userId, description);
    // Verify user is a psychologist and needs profile completion
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (
      !user ||
      user.role !== 'psychologist' ||
      user.status !== 'needs_profile'
    ) {
      throw new ForbiddenException('Invalid request');
    }

    console.log(certificationFile);
    console.log(avatarFile);

    // Store certification file
    const [certUrl, avatarUrl] = await Promise.all([
      this.uploadCertification(certificationFile, userId),
      avatarFile
        ? this.uploadAvatar(avatarFile, userId)
        : Promise.resolve(null),
    ]);

    // Create psychologist record
    await this.prisma.psychologist.create({
      data: {
        userId,
        certUrl,
        specialty,
        phoneNumber,
        avatarUrl,
        approved: false,
        description,
      },
    });

    // Update user status to 'pending' for admin review
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'pending' },
    });

    return { success: true };
  }

  private async uploadCertification(file: Express.Multer.File, userId: number) {
    const key = `certifications/${userId}/${Date.now()}-${file.originalname}`;
    await this.s3Service.uploadFile({
      Bucket: process.env.AWS_S3_BUCKET ?? '',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    return key;
  }

  private async uploadAvatar(file: Express.Multer.File, userId: number) {
    const key = `avatars/${userId}/${Date.now()}-${file.originalname}`;
    await this.s3Service.uploadFile({
      Bucket: process.env.AWS_S3_BUCKET ?? '',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    return key;
  }

  async getApprovedPsychologistsPaginated(
    page: number,
    limit: number,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where = {
      approved: true,
      user: {
        status: 'approved',
        ...(search && {
          OR: [
            { displayName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            {
              Psychologist: {
                description: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        }),
      },
    } as any;

    const [psychologists, totalCount] = await Promise.all([
      this.prisma.psychologist.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          user: {
            displayName: 'asc',
          },
        },
      }),
      this.prisma.psychologist.count({ where }),
    ]);

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

    return {
      data: psychologistsWithUrls,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getPsychologistById(id: number) {
    const psych = await this.prisma.psychologist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!psych) {
      throw new Error('Psychologist not found');
    }

    const [avatarUrl, certUrl] = await Promise.all([
      psych.avatarUrl ? this.s3Service.getFileUrl(psych.avatarUrl) : null,
      psych.certUrl ? this.s3Service.getFileUrl(psych.certUrl) : null,
    ]);

    return {
      ...psych,
      avatarUrl,
      certUrl,
    };
  }

  async getUsersAssignedToPsychologist(psychologistUserId: number) {
    // Get the psychologist ID via userId
    const psychologist = await this.prisma.psychologist.findUnique({
      where: { userId: psychologistUserId },
      select: { id: true },
    });

    if (!psychologist) {
      throw new Error('Psychologist not found');
    }

    // Fetch assigned users
    const assignedUsers = await this.prisma.psychologistOnUser.findMany({
      where: { psychologistId: psychologist.id, dataStatus: 'approved' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return assignedUsers.map((entry) => {
      return { ...entry.user, dataStatus: entry.dataStatus };
    });
  }

  async unassignUser(psychologistId: number, userId: number) {
    const psychologistUser = await this.prisma.user.findUnique({
      where: { id: psychologistId },
    });

    const psychologist = await this.prisma.psychologist.findUnique({
      where: { userId: psychologistId },
      select: { id: true },
    });

    if (!psychologist || !psychologistUser) {
      throw new Error('Psychologist not found');
    }

    await this.prisma.psychologistOnUser.delete({
      where: {
        psychologistId_userId: {
          psychologistId: psychologist?.id,
          userId,
        },
      },
    });

    await this.notificationsService.createNotification({
      userId: userId,
      message: `Психолог ${psychologistUser.displayName} закінчив співробітництво`,
      type: 'SYSTEM_MESSAGE',
    });
  }

  async unassignPsych(userId: number, psychologistId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const psychologist = await this.prisma.psychologist.findUnique({
      where: { id: psychologistId },
      select: { userId: true },
    });

    if (!psychologist || !user) {
      throw new Error('Psychologist not found');
    }

    await this.prisma.psychologistOnUser.delete({
      where: {
        psychologistId_userId: {
          psychologistId,
          userId,
        },
      },
    });

    await this.notificationsService.createNotification({
      userId: psychologist?.userId,
      message: `Клієнт ${user.displayName} закінчив співробітництво`,
      type: 'SYSTEM_MESSAGE',
    });
  }
}
