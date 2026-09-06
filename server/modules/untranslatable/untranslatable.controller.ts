import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { UntranslatableService } from './untranslatable.service';

@Controller('api/untranslatable')
export class UntranslatableController {
  constructor(
    @Inject(UntranslatableService)
    private readonly service: UntranslatableService,
  ) {}

  @Get('discovery-of-the-day')
  async getDiscoveryOfTheDay() {
    return this.service.getDiscoveryOfTheDay();
  }

  @Get()
  async getAll(
    @Query('featured') featured?: string,
    @Query('search') search?: string,
  ) {
    return this.service.getAll(featured === 'true', search);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }
}
