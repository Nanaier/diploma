// src/auth/user-role.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class UserRoleGuard extends JwtAuthGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check JWT validity
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only allow users (not psychologists) to proceed
    return user.role === 'user';
  }
}
