import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.headers['x-session-id'] as string;

    if (!sessionId) {
      throw new UnauthorizedException('Session ID is required');
    }

    const isValid = await this.authService.validateSession(sessionId);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return true;
  }
}

