import { Controller, Get, Post, Body, Param, Query, Inject } from '@nestjs/common';
import { VerificationService, SubmitVerificationDto } from './verification.service';
import { VerificationStatus } from '@prisma/client';

@Controller('api/verification')
export class VerificationController {
  constructor(
    @Inject(VerificationService)
    private readonly service: VerificationService,
  ) {}

  @Get('queue')
  async getQueue(
    @Query('regionId') regionId?: string,
    @Query('status') status?: VerificationStatus,
  ) {
    return this.service.getQueue(regionId, status);
  }

  @Post(':recordId/submit')
  async submitVerification(
    @Param('recordId') recordId: string,
    @Body() dto: SubmitVerificationDto,
  ) {
    return this.service.submitVerification(recordId, dto);
  }

  @Post(':recordId/endorse')
  async endorseRecord(
    @Param('recordId') recordId: string,
    @Body() body: { notes?: string },
  ) {
    return this.service.submitVerification(recordId, {
      action: 'ENDORSE',
      reviewerRole: 'STEWARD',
      notes: body.notes || 'Endorsed by Regional Cultural Steward',
    });
  }
}
