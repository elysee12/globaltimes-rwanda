import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {
    // Initialize email transporter if credentials are available
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (emailUser && emailPass) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
    }
  }

  async validateAdmin(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (admin && await bcrypt.compare(password, admin.password)) {
      const { password: _, ...result } = admin;
      return result;
    }
    return null;
  }

  async login(admin: any, ipAddress?: string, userAgent?: string) {
    const payload = { username: admin.username, sub: admin.id };
    const accessToken = this.jwtService.sign(payload);
    
    // Generate unique session ID
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    // Session expires in 24 hours (or use JWT expiration)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create session in database
    await this.prisma.session.create({
      data: {
        sessionId,
        adminId: admin.id,
        expiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        isActive: true,
      },
    });
    
    return {
      access_token: accessToken,
      session_id: sessionId,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    };
  }

  async createAdmin(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
  }

  async changePassword(adminId: number, currentPassword: string, newPassword: string) {
    // Validate inputs
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current password and new password are required');
    }

    // Validate new password length
    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    // Get the admin with current password
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Prevent setting the same password
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    try {
      const updatedAdmin = await this.prisma.admin.update({
        where: { id: adminId },
        data: { password: hashedNewPassword },
        select: {
          id: true,
          username: true,
        },
      });

      // Verify the update was successful by checking the database
      const verifyAdmin = await this.prisma.admin.findUnique({
        where: { id: adminId },
        select: { password: true },
      });

      if (!verifyAdmin) {
        throw new Error('Failed to verify password update');
      }

      // Verify the new password matches what we just set
      const passwordMatches = await bcrypt.compare(newPassword, verifyAdmin.password);
      if (!passwordMatches) {
        throw new Error('Password update verification failed');
      }

      return {
        message: 'Password changed successfully',
        admin: {
          id: updatedAdmin.id,
          username: updatedAdmin.username,
        },
      };
    } catch (error) {
      // If it's already a known exception, rethrow it
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      // Otherwise, wrap in a generic error
      throw new BadRequestException(`Failed to update password: ${error.message || 'Unknown error'}`);
    }
  }

  async requestPasswordReset(usernameOrEmail: string) {
    // Find admin by username or email
    const admin = await this.prisma.admin.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });

    if (!admin) {
      // Don't reveal if user exists or not for security
      return {
        message: 'If an account with that username or email exists, a password reset OTP has been sent.',
      };
    }

    if (!admin.email) {
      throw new BadRequestException('No email address associated with this account. Please contact administrator.');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete any existing unused reset OTPs for this admin
    await this.prisma.passwordReset.deleteMany({
      where: {
        username: admin.username,
        used: false,
      },
    });

    // Create new password reset record with OTP
    await this.prisma.passwordReset.create({
      data: {
        username: admin.username,
        token: otp, // Store OTP in token field
        expiresAt,
      },
    });

    // Send password reset email with OTP
    if (this.emailTransporter) {
      try {
        await this.emailTransporter.sendMail({
          from: `"Global Times Rwanda" <${process.env.EMAIL_USER}>`,
          to: admin.email,
          subject: 'Password Reset OTP',
          html: `
            <h2>Password Reset OTP</h2>
            <p>You requested to reset your password for your Global Times Rwanda admin account.</p>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="font-size: 32px; font-weight: bold; color: #1e3a8a; text-align: center; padding: 20px; background-color: #f0f0f0; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p><strong>This OTP is valid for 10 minutes.</strong></p>
            <p>Enter this OTP on the password reset page along with your new password.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
          `,
          text: `
Password Reset OTP

You requested to reset your password for your Global Times Rwanda admin account.

Your One-Time Password (OTP) is: ${otp}

This OTP is valid for 10 minutes.

Enter this OTP on the password reset page along with your new password.

If you did not request this password reset, please ignore this email.
          `,
        });
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        // Don't fail the request if email fails, but log it
      }
    } else {
      console.warn('Email transporter not configured. Password reset email not sent.');
      // In development, log the OTP
      if (process.env.NODE_ENV !== 'production') {
        console.log('Password reset OTP (dev only):', otp);
      }
    }

    return {
      message: 'If an account with that username or email exists, a password reset OTP has been sent.',
    };
  }

  async verifyResetOtp(usernameOrEmail: string, otp: string) {
    // Find admin by username or email
    const admin = await this.prisma.admin.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin account not found');
    }

    // Find reset record by username and OTP
    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: {
        username: admin.username,
        token: otp,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid OTP');
    }

    if (resetRecord.used) {
      throw new BadRequestException('This OTP has already been used');
    }

    if (resetRecord.expiresAt < new Date()) {
      // Delete expired OTPs
      await this.prisma.passwordReset.deleteMany({
        where: {
          username: admin.username,
          token: otp,
          expiresAt: { lt: new Date() },
        },
      });
      throw new BadRequestException('This OTP has expired. Please request a new one.');
    }

    return {
      valid: true,
      username: admin.username,
    };
  }

  async resetPasswordWithOtp(usernameOrEmail: string, otp: string, newPassword: string) {
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    // Find admin by username or email
    const admin = await this.prisma.admin.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin account not found');
    }

    // Verify OTP
    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: {
        username: admin.username,
        token: otp,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid OTP');
    }

    if (resetRecord.used) {
      throw new BadRequestException('This OTP has already been used');
    }

    if (resetRecord.expiresAt < new Date()) {
      await this.prisma.passwordReset.deleteMany({
        where: {
          username: admin.username,
          token: otp,
          expiresAt: { lt: new Date() },
        },
      });
      throw new BadRequestException('This OTP has expired. Please request a new one.');
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedNewPassword },
    });

    // Mark OTP as used
    await this.prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    // Delete all unused OTPs for this admin
    await this.prisma.passwordReset.deleteMany({
      where: {
        username: admin.username,
        used: false,
      },
    });

    return {
      message: 'Password has been reset successfully',
    };
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { sessionId },
    });

    if (!session) {
      return false;
    }

    // Check if session is active
    if (!session.isActive) {
      return false;
    }

    // Check if session has expired
    if (session.expiresAt < new Date()) {
      // Mark as inactive
      await this.prisma.session.update({
        where: { id: session.id },
        data: { isActive: false },
      });
      return false;
    }

    // Update last activity
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastActivity: new Date() },
    });

    return true;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { sessionId, isActive: true },
      data: { isActive: false },
    });
  }

  async invalidateAllSessions(adminId: number, excludeSessionId?: string): Promise<void> {
    const where: any = { adminId, isActive: true };
    if (excludeSessionId) {
      where.sessionId = { not: excludeSessionId };
    }
    
    await this.prisma.session.updateMany({
      where,
      data: { isActive: false },
    });
  }

  async getActiveSessions(adminId: number): Promise<any[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        adminId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
      select: {
        id: true,
        sessionId: true,
        createdAt: true,
        lastActivity: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
      },
    });

    return sessions;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false },
        ],
      },
      data: { isActive: false },
    });

    return result.count;
  }
}
