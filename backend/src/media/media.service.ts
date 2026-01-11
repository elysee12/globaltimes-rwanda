import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateMediaDto {
  name: string;
  url: string;
  type: 'image' | 'video';
  size?: number;
  mimeType?: string;
}

export class UpdateMediaDto {
  name?: string;
  url?: string;
  type?: 'image' | 'video';
  size?: number;
  mimeType?: string;
}

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async create(createMediaDto: CreateMediaDto) {
    return this.prisma.media.create({
      data: createMediaDto,
    });
  }

  async findAll(filters?: { type?: string }) {
    const where: any = {};
    
    if (filters?.type) {
      where.type = filters.type;
    }

    return this.prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return media;
  }

  async update(id: number, updateMediaDto: UpdateMediaDto) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return this.prisma.media.update({
      where: { id },
      data: updateMediaDto,
    });
  }

  async remove(id: number) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return this.prisma.media.delete({
      where: { id },
    });
  }
}

