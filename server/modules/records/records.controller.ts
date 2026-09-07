import { Controller, Get, Post, Delete, Body, Param, Query, Inject, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { RecordsService, CreateRecordDto, RecordFilterQuery } from './records.service';

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
  async getRecords(@Query() query: RecordFilterQuery) {
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

  @Get(':id')
  async getRecordById(@Param('id') id: string) {
    return this.service.getRecordById(id);
  }

  @Delete(':id')
  async deleteRecord(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Query('role') role?: string,
  ) {
    return this.service.deleteRecord(id, userId, role);
  }
}

