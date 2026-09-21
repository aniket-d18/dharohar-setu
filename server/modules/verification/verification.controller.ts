import { Controller, Get, Post, Body, Param, Query, Inject, UseGuards } from '@nestjs/common';
import { VerificationService, SubmitVerificationDto } from './verification.service';
import { VerificationStatus } from '@prisma/client';
import { JwtAuthGuard, JwtUserPayload } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/verification')
export class VerificationController {
  constructor(
    @Inject(VerificationService)
    private readonly service: VerificationService,
  ) {}


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('REVIEWER', 'STEWARD', 'EXPERT', 'ADMIN')
  @Get('queue')
  async getQueue(
    @Query('regionId') regionId?: string,
    @Query('status') status?: VerificationStatus,
  ) {
    return this.service.getQueue(regionId, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('REVIEWER', 'STEWARD', 'EXPERT', 'ADMIN')
  @Post(':recordId/submit')
  async submitVerification(
    @Param('recordId') recordId: string,
    @Body() dto: SubmitVerificationDto,
    @CurrentUser() user: JwtUserPayload,
  ) {
    // Bind reviewer identity directly from verified cryptographic JWT token claims
    dto.reviewerId = user.id;
    dto.reviewerRole = user.role;
    dto.reviewerName = user.displayName || 'Cultural Verifier';

    return this.service.submitVerification(recordId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STEWARD', 'ADMIN')
  @Post(':recordId/endorse')
  async endorseRecord(
    @Param('recordId') recordId: string,
    @Body() body: { notes?: string },
    @CurrentUser() user: JwtUserPayload,
  ) {
    return this.service.submitVerification(recordId, {
      action: 'ENDORSE',
      reviewerId: user.id,
      reviewerRole: user.role,
      reviewerName: user.displayName || 'Regional Cultural Steward',
      notes: body.notes || 'Endorsed by Regional Cultural Steward',
    });
  }
}

