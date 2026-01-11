import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { AdvertisementsModule } from './advertisements/advertisements.module';
import { MediaModule } from './media/media.module';
import { UploadModule } from './upload/upload.module';
import { StatsModule } from './stats/stats.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    NewsModule,
    AdvertisementsModule,
    MediaModule,
    UploadModule,
    StatsModule,
    AnnouncementsModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
