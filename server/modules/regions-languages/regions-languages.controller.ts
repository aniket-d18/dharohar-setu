import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { RegionsLanguagesService } from './regions-languages.service';

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

  @Get('languages/fading-fastest')
  async getFadingFastestLanguages(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 5;
    return this.service.getFadingFastestLanguages(parsedLimit);
  }

  @Get('languages')
  async getAllLanguages() {
    return this.service.getAllLanguages();
  }

  @Get('crafts')
  async getCrafts() {
    return this.service.getCrafts();
  }
}
