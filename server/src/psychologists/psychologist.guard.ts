import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class PsychologistGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only allow psychologists who need to complete their profile
    if (user.role !== 'psychologist' || user.status !== 'needs_profile') {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
