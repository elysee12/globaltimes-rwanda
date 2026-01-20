import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  titleEN: string;

  @IsString()
  titleRW: string;

  @IsString()
  titleFR: string;

  @IsString()
  excerptEN: string;

  @IsString()
  excerptRW: string;

  @IsString()
  excerptFR: string;

  @IsString()
  contentEN: string;

  @IsString()
  contentRW: string;

  @IsString()
  contentFR: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  videos?: string[];

  @IsOptional()
  imageCaptions?: Record<string, { EN?: string; RW?: string; FR?: string }>;

  @IsString()
  author: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  trending?: boolean;
}

export class UpdateNewsDto {
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
  excerptEN?: string;

  @IsOptional()
  @IsString()
  excerptRW?: string;

  @IsOptional()
  @IsString()
  excerptFR?: string;

  @IsOptional()
  @IsString()
  contentEN?: string;

  @IsOptional()
  @IsString()
  contentRW?: string;

  @IsOptional()
  @IsString()
  contentFR?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  videos?: string[];

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  trending?: boolean;
}

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(createNewsDto: CreateNewsDto) {
    const { images, videos, imageCaptions, ...rest } = createNewsDto as any;
    return this.prisma.news.create({
      data: {
        ...rest,
        images: images ?? [],
        videos: videos ?? [],
        imageCaptions: imageCaptions ?? {},
        featured: createNewsDto.featured ?? false,
        trending: createNewsDto.trending ?? false,
        publishedAt: new Date(),
      },
    });
  }

  async findAll(filters?: { category?: string; featured?: boolean; limit?: number; offset?: number }) {
    const where: any = {};
    
    if (filters?.category) {
      where.category = filters.category;
    }
    
    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    const [data, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit,
        skip: filters?.offset,
      }),
      this.prisma.news.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    // Increment views
    await this.prisma.news.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return news;
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    const { images, videos, imageCaptions, ...rest } = updateNewsDto as any;

    return this.prisma.news.update({
      where: { id },
      data: {
        ...rest,
        ...(images !== undefined ? { images } : {}),
        ...(videos !== undefined ? { videos } : {}),
        ...(imageCaptions !== undefined ? { imageCaptions } : {}),
      },
    });
  }

  async remove(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    return this.prisma.news.delete({
      where: { id },
    });
  }

  async getByCategory(category: string, limit?: number) {
    return this.prisma.news.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getFeatured(limit: number = 3) {
    return this.prisma.news.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getTrending(limit: number = 5) {
    return this.prisma.news.findMany({
      where: { trending: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

