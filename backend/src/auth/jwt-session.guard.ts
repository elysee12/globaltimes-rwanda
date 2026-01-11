import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';

@Injectable()
export class JwtSessionGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First validate JWT token
    const jwtValid = await super.canActivate(context) as boolean;
    if (!jwtValid) {
      return false;
    }

    // Then validate session if session ID is provided
    const request = context.switchToHttp().getRequest();
    const sessionId = request.headers['x-session-id'] as string;

    if (sessionId) {
      const isValid = await this.authService.validateSession(sessionId);
      if (!isValid) {
        throw new UnauthorizedException('Invalid or expired session');
      }
    } else {
      // Session ID is optional for backward compatibility, but recommended
      // You can make it required by throwing an error here
    }

    return true;
  }
}

