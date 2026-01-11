import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export const AD_PLACEMENTS = [
  'banner',
  'sidebar',
  'inline',
  'header',
  'footer',
  'ticker',
  'hero',
  'article',
] as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[number];

const normalizePlacement = (placement?: string): AdPlacement => {
  if (!placement) {
    return 'banner';
  }
  const normalized = placement.toLowerCase() as AdPlacement;
  return (AD_PLACEMENTS as readonly string[]).includes(normalized) ? normalized : 'banner';
};

const sanitizeOptionalString = (value?: string | null): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export class CreateAdvertisementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsIn(AD_PLACEMENTS)
  placement: AdPlacement;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link URL must be a valid URL' })
  linkUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateAdvertisementDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsIn(AD_PLACEMENTS)
  placement?: AdPlacement;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link URL must be a valid URL' })
  linkUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

@Injectable()
export class AdvertisementsService {
  constructor(private prisma: PrismaService) {}

  async create(createAdDto: CreateAdvertisementDto) {
    const mediaUrl = sanitizeOptionalString(createAdDto.mediaUrl);
    const linkUrl = sanitizeOptionalString(createAdDto.linkUrl);

    return this.prisma.advertisement.create({
      data: {
        title: createAdDto.title.trim(),
        placement: normalizePlacement(createAdDto.placement),
        mediaUrl: mediaUrl ?? null,
        linkUrl: linkUrl ?? null,
        isPublished: createAdDto.isPublished ?? true,
      },
    });
  }

  async findAll(filters?: { placement?: string; isPublished?: boolean }) {
    const where: Record<string, unknown> = {};

    if (filters?.placement) {
      where.placement = normalizePlacement(filters.placement);
    }

    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
    }

    return this.prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id },
    });

    if (!ad) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    return ad;
  }

  async update(id: number, updateAdDto: UpdateAdvertisementDto) {
    await this.ensureExists(id);

    return this.prisma.advertisement.update({
      where: { id },
      data: {
        title: updateAdDto.title ? updateAdDto.title.trim() : undefined,
        placement: updateAdDto.placement ? normalizePlacement(updateAdDto.placement) : undefined,
        mediaUrl: sanitizeOptionalString(updateAdDto.mediaUrl),
        linkUrl: sanitizeOptionalString(updateAdDto.linkUrl),
        isPublished: updateAdDto.isPublished,
      },
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);

    return this.prisma.advertisement.delete({
      where: { id },
    });
  }

  async getByPlacement(placement: string) {
    return this.prisma.advertisement.findMany({
      where: {
        placement: normalizePlacement(placement),
        isPublished: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async ensureExists(id: number) {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id },
    });

    if (!ad) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }
  }
}

