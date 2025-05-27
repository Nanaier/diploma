// src/auth/user-role.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class PsychRoleGuard extends JwtAuthGuard {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check JWT validity
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return user.role === 'psychologist' && user.status === 'approved';
  }
}
