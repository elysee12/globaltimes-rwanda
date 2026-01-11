import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsOptional, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  titleEN: string;

  @IsString()
  titleRW: string;

  @IsString()
  titleFR: string;

  @IsString()
  descriptionEN: string;

  @IsString()
  descriptionRW: string;

  @IsString()
  descriptionFR: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsString()
  file?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileType?: string;
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  titleEN?: string;

  @IsOptional()
  @IsString()
  titleRW?: string;

  @IsOptional()
  @IsString()
  titleFR?: string;

  @IsOptional()
  @IsString()
  descriptionEN?: string;

  @IsOptional()
  @IsString()
  descriptionRW?: string;

  @IsOptional()
  @IsString()
  descriptionFR?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsString()
  file?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileType?: string;
}

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(createAnnouncementDto: CreateAnnouncementDto) {
    return this.prisma.announcement.create({
      data: createAnnouncementDto,
    });
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return announcement;
  }

  async update(id: number, updateAnnouncementDto: UpdateAnnouncementDto) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    // Filter out undefined values
    const data = Object.fromEntries(
      Object.entries(updateAnnouncementDto).filter(([, v]) => v !== undefined)
    );

    return this.prisma.announcement.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return this.prisma.announcement.delete({
      where: { id },
    });
  }
}

