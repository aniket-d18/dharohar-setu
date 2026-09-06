import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { VerificationAction, VerificationStatus } from '@prisma/client';

export class SubmitVerificationDto {
  action!: VerificationAction;
  reviewerId?: string;
  reviewerName?: string;
  reviewerRole?: 'CONTRIBUTOR' | 'REVIEWER' | 'STEWARD' | 'EXPERT' | 'ADMIN';
  submittedTranscription?: string;
  submittedTranslation?: string;
  notes?: string;
  documentUrl?: string;
  documentName?: string;
}

@Injectable()
export class VerificationService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // 1. Get verification queue of unverified or pending records
  async getQueue(regionId?: string, status?: VerificationStatus) {
    const where: any = {};
    if (status) {
      where.verificationStatus = status;
    } else {
      where.verificationStatus = {
        in: ['UNVERIFIED', 'COMMUNITY_VERIFIED'],
      };
    }
    if (regionId) {
      where.regionId = regionId;
    }

    return this.prisma.record.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        region: {
          select: {
            id: true,
            name: true,
            level: true,
            vitalityStatus: true,
            vitalityScore: true,
          },
        },
        language: {
          select: {
            id: true,
            name: true,
            scriptName: true,
            vitalityStatus: true,
          },
        },
        consentRecord: true,
        contributor: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
        verifications: {
          include: {
            reviewer: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // 2. Submit verification action (AGREE, EDIT, DISPUTE, ENDORSE)
  async submitVerification(recordId: string, dto: SubmitVerificationDto) {
    try {
      const record = await this.prisma.record.findUnique({
        where: { id: recordId },
      });

      if (!record) {
        throw new NotFoundException(`Record with ID ${recordId} not found`);
      }

      // Requirement 6: Self-review prevention
      if (record.contributorId && dto.reviewerId && record.contributorId === dto.reviewerId) {
        throw new BadRequestException(
          'A reviewer cannot verify or dispute a record they personally submitted as a contributor. An independent reviewer must verify this record.',
        );
      }

      // Ensure or get a reviewer Contributor
      let reviewer = dto.reviewerId
        ? await this.prisma.contributor.findUnique({ where: { id: dto.reviewerId } })
        : null;

      if (!reviewer) {
        reviewer = await this.prisma.contributor.findFirst({
          where: {
            role: dto.reviewerRole || 'REVIEWER',
          },
        });
      }

      if (!reviewer) {
        reviewer = await this.prisma.contributor.create({
          data: {
            displayName: dto.reviewerName || 'Cultural Reviewer',
            role: dto.reviewerRole || 'REVIEWER',
            points: 10,
            badges: ['Linguistic Verifier'],
          },
        });
      }

      // Append to VerificationLog
      const log = await this.prisma.verificationLog.create({
        data: {
          recordId,
          reviewerId: reviewer.id,
          action: dto.action,
          submittedTranscription: dto.submittedTranscription,
          submittedTranslation: dto.submittedTranslation,
          notes: dto.notes,
          documentUrl: dto.documentUrl,
          documentName: dto.documentName,
        },
      });

      // Update Record status according to action
      let newStatus: VerificationStatus = record.verificationStatus;
      const updateData: any = {};

      if (dto.action === 'ENDORSE') {
        newStatus = 'STEWARD_ENDORSED';
      } else if (dto.action === 'AGREE') {
        newStatus = 'COMMUNITY_VERIFIED';
      } else if (dto.action === 'EDIT') {
        newStatus = 'COMMUNITY_VERIFIED';
        if (dto.submittedTranscription !== undefined && dto.submittedTranscription !== null) {
          updateData.transcriptionText = dto.submittedTranscription.trim();
        }
        if (dto.submittedTranslation !== undefined && dto.submittedTranslation !== null) {
          updateData.translationText = dto.submittedTranslation.trim();
        }
      }

      updateData.verificationStatus = newStatus;

      const updatedRecord = await this.prisma.record.update({
        where: { id: recordId },
        data: updateData,
        include: {
          region: true,
          language: true,
          verifications: {
            include: { reviewer: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return {
        success: true,
        log,
        record: updatedRecord,
      };
    } catch (err: any) {
      console.error('[submitVerification Error]:', err);
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(`Verification submission failed: ${err.message || err}`);
    }
  }
}
