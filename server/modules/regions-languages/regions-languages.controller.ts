import { Controller, Get, Post, Put, Body, Param, Query, Inject, UseGuards } from '@nestjs/common';
import { RegionsLanguagesService } from './regions-languages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api')
export class RegionsLanguagesController {
  constructor(
    @Inject(RegionsLanguagesService)
    private readonly service: RegionsLanguagesService,
  ) {}

  @Get('regions')
  async getRegionsHierarchy() {
    return this.service.getRegionsHierarchy();
  }

  @Get('regions/:id/geojson')
  async getRegionGeoJson(@Param('id') id: string) {
    return this.service.getRegionGeoJson(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STEWARD')
  @Post('regions/recalculate-vitality')
  async recalculateAllRegionsVitality() {
    return this.service.recalculateAllRegions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STEWARD')
  @Post('regions/:id/recalculate-vitality')
  async recalculateSingleRegionVitality(@Param('id') id: string) {
    return this.service.recalculateRegionVitality(id);
  }

  @Get('languages/fading-fastest')
  async getFadingFastestLanguages(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 5;
    return this.service.getFadingFastestLanguages(parsedLimit);
  }

  @Get('languages')
  async getAllLanguages() {
    return this.service.getAllLanguages();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('REVIEWER', 'STEWARD', 'EXPERT', 'ADMIN')
  @Put('languages/:id')
  async updateLanguage(
    @Param('id') id: string,
    @Body() dto: {
      estimatedSpeakers?: number;
      averageSpeakerAge?: number;
      vitalityStatus?: any;
      name?: string;
    },
  ) {
    return this.service.updateLanguage(id, dto);
  }

  @Get('crafts')
  async getCrafts() {
    return this.service.getCrafts();
  }
}

