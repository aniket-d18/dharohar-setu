import { Controller, Get } from '@nestjs/common';

@Controller(['health', 'api/health'])
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'dharohar-setu-api',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
