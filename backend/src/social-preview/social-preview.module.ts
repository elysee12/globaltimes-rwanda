import { Module } from '@nestjs/common';
import { SocialPreviewController } from './social-preview.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SocialPreviewController],
})
export class SocialPreviewModule {}
