import { Controller, Get, Post, Delete, Body, Param, Query, Headers, Inject, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { RecordsService, CreateRecordDto, RecordFilterQuery } from './records.service';
import { JwtAuthGuard, JwtUserPayload } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/records')
export class RecordsController {
  constructor(
    @Inject(RecordsService)
    private readonly service: RecordsService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'public', 'uploads');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname) || '';
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }
    return {
      url: `/uploads/${file.filename}`,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('presigned-url')
  async generatePresignedUrl(
    @Body() body: { mediaType: string; filename: string },
  ) {
    return this.service.generatePresignedUrl(body.mediaType || 'AUDIO', body.filename || 'recording.mp3');
  }

  @Post()
  async createRecord(@Body() dto: CreateRecordDto) {
    return this.service.createRecord(dto);
  }


  @Get()
  async getRecords(
    @Query() query: RecordFilterQuery,
    @Headers('authorization') authHeader?: string,
  ) {
    // Decode the JWT (if present) to inject requester identity into the query.
    // The JWT is already verified by JwtAuthGuard on protected routes; here we
    // just decode the payload for visibility scoping on this public list endpoint.
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payloadB64 = token.split('.')[1];
        if (payloadB64) {
          const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
          query.requesterId = payload.sub || payload.id || undefined;
          query.requesterRole = payload.role || undefined;
        }
      } catch (_) {
        // Malformed token — treat as anonymous
      }
    }
    return this.service.getRecords(query);
  }

  @Post('translate')
  async translateRecord(
    @Body() body: { recordId?: string; recordIds?: string[]; languageCode: string },
  ) {
    if (!body.languageCode) {
      throw new BadRequestException('languageCode is required');
    }
    if (body.recordIds && Array.isArray(body.recordIds) && body.recordIds.length > 0) {
      return this.service.translateBatch(body.recordIds, body.languageCode);
    }
    if (body.recordId) {
      return this.service.translateRecord(body.recordId, body.languageCode);
    }
    throw new BadRequestException('Either recordId or recordIds must be provided');
  }

  @Get(':id/translation')
  async getRecordTranslation(
    @Param('id') id: string,
    @Query('lang') lang: string,
  ) {
    if (!lang) {
      throw new BadRequestException('lang query parameter is required');
    }
    return this.service.translateRecord(id, lang);
  }

  @Get('contributor/:contributorId')
  async getContributorRecords(@Param('contributorId') contributorId: string) {
    return this.service.getContributorRecords(contributorId);
  }

  @Post(':id/resubmit')
  async resubmitRecord(
    @Param('id') id: string,
    @Body()
    body: {
      contributorId: string;
      summaryText?: string;
      transcriptionText?: string;
      translationText?: string;
      resubmissionNotes?: string;
      mediaUrl?: string;
    },
  ) {
    return this.service.resubmitRecord(id, body);
  }

  @Post(':id/ai-enrich')
  async triggerAiEnrichment(@Param('id') id: string) {
    return this.service.triggerAiEnrichment(id);
  }

  @Post(':id/upvote')
  async toggleUpvote(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    if (!body?.userId) {
      throw new BadRequestException('userId is required to upvote');
    }
    return this.service.toggleUpvote(id, body.userId);
  }

  @Get(':id')
  async getRecordById(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    let requesterId = userId;
    let requesterRole: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payloadB64 = token.split('.')[1];
        if (payloadB64) {
          const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
          requesterId = requesterId || payload.sub || payload.id;
          requesterRole = payload.role;
        }
      } catch (_) {}
    }

    return this.service.getRecordById(id, requesterId, requesterRole);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('REVIEWER', 'STEWARD', 'EXPERT', 'ADMIN')
  @Delete(':id')
  async deleteRecord(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
  ) {
    return this.service.deleteRecord(id, user.id, user.role);
  }
}

