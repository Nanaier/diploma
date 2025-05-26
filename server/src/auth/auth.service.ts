import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PsychologistRegisterDto } from './dto/psychologist-register.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        role: dto.role ?? 'user',
        displayName: dto.displayName,
        status: 'approved', // Regular users are approved by default
      },
    });

    return this.signToken(user.id, user.email, user.role, user.status);
  }

  async registerPsychologist(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    // Create user with 'needs_profile' status
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        role: 'psychologist',
        displayName: dto.displayName,
        status: 'needs_profile',
      },
    });

    return {
      access_token: this.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      }),
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
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
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email, user.role, user.status);
  }

  signToken(id: number, email: string, role: string, status?: string) {
    return {
      access_token: this.jwt.sign({ sub: id, email, role, status }),
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        assignedPsychs: {
          include: {
            psychologist: {
              include: {
                user: true, // to access psychologist's user profile (email, displayName, etc.)
              },
            },
          },
        },
        Psychologist: {
          include: {
            users: {
              include: {
                user: true, // to access assigned users' profile
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    console.log(user);

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      description: user.description,

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

  async deleteMe(userId: number) {
    const exists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!exists) throw new NotFoundException('User not found');

    await this.prisma.$transaction(async (tx) => {
      await this.notificationsService.cancelAllScheduledRemindersForUser(
        userId,
      );

      await tx.booking.deleteMany({
        where: { userId },
      });

      await tx.notification.deleteMany({ where: { userId } });

      await tx.event.deleteMany({
        where: {
          OR: [{ userId }, { createdById: userId }],
        },
      });

      await tx.psychologistOnUser.deleteMany({
        where: {
          OR: [{ userId }, { psychologist: { userId } }],
        },
      });

      await tx.psychologist.deleteMany({
        where: { userId },
      });

      await tx.user.delete({
        where: { id: userId },
      });
    });

    return { success: true };
  }
}
