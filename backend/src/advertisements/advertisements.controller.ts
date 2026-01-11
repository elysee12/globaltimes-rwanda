import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdvertisementsService, CreateAdvertisementDto, UpdateAdvertisementDto } from './advertisements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createAdDto: CreateAdvertisementDto) {
    return this.advertisementsService.create(createAdDto);
  }

  @Get()
  findAll(@Query('placement') placement?: string, @Query('isPublished') isPublished?: string) {
    return this.advertisementsService.findAll({
      placement,
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
    });
  }

  @Get('placement/:placement')
  getByPlacement(@Param('placement') placement: string) {
    return this.advertisementsService.getByPlacement(placement);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.advertisementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAdDto: UpdateAdvertisementDto) {
    return this.advertisementsService.update(id, updateAdDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.advertisementsService.remove(id);
  }
}

