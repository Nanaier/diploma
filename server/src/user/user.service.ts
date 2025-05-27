import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TaggingService } from 'src/tagging/tagging.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private taggingService: TaggingService,
  ) {}

  async updateDescription(userId: number, description: string) {
    await this.taggingService.processUserPreferenceTags(userId, description);

    return this.prisma.user.update({
      where: { id: userId },
      data: { description: description },
    });
  }

  async shareData(userId: number, psychologistId: number) {
    return this.prisma.psychologistOnUser.update({
      where: {
        psychologistId_userId: {
          psychologistId,
          userId,
        },
      },
      data: { dataStatus: 'approved' },
    });
  }

  async getUserInfo(requestingUserId: number, targetUserId: number) {
    const psychologistUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        assignedPsychs: {
          include: {
            psychologist: {
              include: {
                user: true,
              },
            },
          },
        },
        Psychologist: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!psychologistUser || psychologistUser.role !== 'psychologist')
      throw new NotFoundException('Access denied');

    const psychologist = await this.prisma.psychologist.findUnique({
      where: { userId: requestingUserId },
      select: { id: true },
    });

    if (!psychologist) {
      throw new NotFoundException('Psychologist not found');
    }

    const isAssigned = await this.prisma.psychologistOnUser.findFirst({
      where: {
        psychologistId: psychologist.id,
        userId: targetUserId,
        dataStatus: 'approved',
      },
    });

    if (isAssigned) {
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
        description: user.description,
        createdAt: user.createdAt,
        assignedPsychologists: user.assignedPsychs.map((p) => ({
          id: p.psychologist.id,
          approved: p.psychologist.approved,
          dataStatus: p.dataStatus,
          specialty: p.psychologist.specialty,
          user: {
            id: p.psychologist.user.id,
            email: p.psychologist.user.email,
            displayName: p.psychologist.user.displayName,
            status: p.psychologist.user.status,
          },
        })),
        assignedUsers:
          user.Psychologist?.users.map((u) => ({
            id: u.user.id,
            email: u.user.email,
            displayName: u.user.displayName,
            status: u.user.status,
          })) || [],
        Psychologist: user.Psychologist,
      };
    }

    throw new NotFoundException('Access denied: Not assigned to this user');
  }
}
