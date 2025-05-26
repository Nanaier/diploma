import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class PendingPsychologistGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only allow psychologists pending approval
    if (user.role !== 'psychologist' || user.status !== 'pending') {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
