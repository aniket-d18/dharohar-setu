import { Controller, Get, Inject } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(
    @Inject(AnalyticsService)
    private readonly service: AnalyticsService,
  ) {}

  @Get('live-counters')
  async getLiveCounters() {
    return this.service.getLiveCounters();
  }

  @Get('dashboard')
  async getDashboardAnalytics() {
    return this.service.getDashboardAnalytics();
  }
}
