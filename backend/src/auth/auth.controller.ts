import { Controller, Post, Get, Body, Param, UnauthorizedException, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class RequestPasswordResetDto {
  @IsString()
  usernameOrEmail: string;
}

export class VerifyOtpDto {
  @IsString()
  usernameOrEmail: string;

  @IsString()
  otp: string;
}

export class ResetPasswordDto {
  @IsString()
  usernameOrEmail: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    if (!loginDto.username || !loginDto.password) {
      throw new BadRequestException('Username and password are required');
    }
    const admin = await this.authService.validateAdmin(
      loginDto.username,
      loginDto.password,
    );
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Get IP address and user agent
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    return this.authService.login(admin, ipAddress, userAgent);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Invalid authentication token');
    }
    
    const adminId = req.user.id;
    
    if (!changePasswordDto.currentPassword || !changePasswordDto.newPassword) {
      throw new BadRequestException('Current password and new password are required');
    }
    
    return this.authService.changePassword(
      adminId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('forgot-password')
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    if (!requestPasswordResetDto.usernameOrEmail) {
      throw new BadRequestException('Username or email is required');
    }
    return this.authService.requestPasswordReset(requestPasswordResetDto.usernameOrEmail);
  }

  @Post('verify-reset-otp')
  async verifyResetOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    if (!verifyOtpDto.usernameOrEmail || !verifyOtpDto.otp) {
      throw new BadRequestException('Username/email and OTP are required');
    }
    return this.authService.verifyResetOtp(verifyOtpDto.usernameOrEmail, verifyOtpDto.otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    if (!resetPasswordDto.usernameOrEmail || !resetPasswordDto.otp || !resetPasswordDto.newPassword) {
      throw new BadRequestException('Username/email, OTP, and new password are required');
    }
    return this.authService.resetPasswordWithOtp(
      resetPasswordDto.usernameOrEmail,
      resetPasswordDto.otp,
      resetPasswordDto.newPassword,
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Request() req) {
    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId) {
      await this.authService.invalidateSession(sessionId);
    }
    return { message: 'Logged out successfully' };
  }

  @Post('validate-session')
  @UseGuards(AuthGuard('jwt'))
  async validateSession(@Request() req) {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      throw new UnauthorizedException('Session ID is required');
    }
    
    const isValid = await this.authService.validateSession(sessionId);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired session');
    }
    
    return { valid: true };
  }

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  async getActiveSessions(@Request() req) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Invalid authentication token');
    }
    
    return this.authService.getActiveSessions(req.user.id);
  }

  @Post('sessions/:sessionId/invalidate')
  @UseGuards(AuthGuard('jwt'))
  async invalidateSession(@Request() req, @Param('sessionId') sessionId: string) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Invalid authentication token');
    }
    
    await this.authService.invalidateSession(sessionId);
    return { message: 'Session invalidated successfully' };
  }
}
