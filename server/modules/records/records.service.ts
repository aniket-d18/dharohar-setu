import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MediaType, Category, Visibility, VerificationStatus, VitalityStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { existsSync } from 'fs';
import { join, extname } from 'path';

export class CreateRecordDto {
  mediaType!: MediaType;
  mediaUrl!: string;
  thumbnailUrl?: string;
  regionId?: string;
  stateName?: string;
  districtName?: string;
  languageId?: string;
  customLanguageName?: string;
  craftId?: string;
  category!: Category;
  tags?: string[];
  speakerName?: string;
  speakerAge?: number;
  visibility?: Visibility;
  transcriptionText?: string;
  translationText?: string;
  summaryText?: string;
  consentScopes?: string[];
  isAnonymous?: boolean;
  contributorId?: string;
}

export class RecordFilterQuery {
  search?: string;
  regionId?: string;
  languageId?: string;
  craftId?: string;
  category?: Category;
  mediaType?: MediaType;
  vitalityStatus?: VitalityStatus;
  verificationStatus?: VerificationStatus;
  sort?: 'newest' | 'urgency' | 'verified';
  page?: number;
  limit?: number;
}

@Injectable()
export class RecordsService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // 1. Presigned upload URL generator (Stubbed / Mock direct upload)
  async generatePresignedUrl(mediaType: string, filename: string) {
    const fileId = randomUUID();
    const extension = filename.split('.').pop() || 'bin';
    const storagePath = `cultural-archives/${mediaType.toLowerCase()}/${fileId}.${extension}`;
    
    // In production, this generates a Supabase Storage signed upload URL or AWS S3 presigned PUT URL
    return {
      uploadUrl: `https://storage.supabase.co/storage/v1/upload/dharohar-bucket/${storagePath}`,
      publicUrl: `https://storage.supabase.co/storage/v1/object/public/dharohar-bucket/${storagePath}`,
      fileId,
      storagePath,
      headers: {
        'Content-Type': mediaType === 'AUDIO' ? 'audio/mpeg' : mediaType === 'VIDEO' ? 'video/mp4' : 'application/octet-stream',
      },
      expiresInSeconds: 3600,
    };
  }

  // 2. Create Record with ConsentRecord & validation
  async createRecord(dto: CreateRecordDto) {
    // 1. Title/Description validation
    const summary = (dto.summaryText || '').trim();
    if (summary.length < 8) {
      throw new BadRequestException('Title / Description must be at least 8 characters long.');
    }
    // Check for keyboard mash without vowels
    if (summary.length < 15 && !/[aeiouy]/i.test(summary)) {
      throw new BadRequestException('Please provide a meaningful cultural title or description.');
    }

    // 2. Speaker age validation (0-120)
    if (dto.speakerAge !== undefined && dto.speakerAge !== null && dto.speakerAge !== ('' as any)) {
      const ageNum = Number(dto.speakerAge);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        throw new BadRequestException('Speaker age must be a realistic number between 0 and 120.');
      }
    }

    // 3. Media or transcription non-empty check
    const hasMedia = dto.mediaUrl && dto.mediaUrl.trim().length > 0;
    const hasTranscription = dto.transcriptionText && dto.transcriptionText.trim().length > 0;
    if (!hasMedia && !hasTranscription) {
      throw new BadRequestException('At minimum, a media recording/file or native transcription must be provided before submission.');
    }

    // 4. Region resolution (Auto-create state / district if not in DB Region table)
    let finalRegionId = dto.regionId;

    if (dto.stateName && dto.stateName.trim()) {
      const stateName = dto.stateName.trim();
      let stateRegion = await this.prisma.region.findFirst({
        where: {
          name: { equals: stateName, mode: 'insensitive' },
          level: 'STATE',
        },
      });

      if (!stateRegion) {
        stateRegion = await this.prisma.region.create({
          data: {
            name: stateName,
            level: 'STATE',
            vitalityStatus: 'VULNERABLE',
            vitalityScore: 50.0,
          },
        });
      }

      if (dto.districtName && dto.districtName.trim()) {
        const districtName = dto.districtName.trim();
        let districtRegion = await this.prisma.region.findFirst({
          where: {
            name: { equals: districtName, mode: 'insensitive' },
            level: 'DISTRICT',
            parentRegionId: stateRegion.id,
          },
        });

        if (!districtRegion) {
          districtRegion = await this.prisma.region.create({
            data: {
              name: districtName,
              level: 'DISTRICT',
              parentRegionId: stateRegion.id,
              vitalityStatus: 'VULNERABLE',
              vitalityScore: 50.0,
            },
          });
        }
        finalRegionId = districtRegion.id;
      } else {
        finalRegionId = stateRegion.id;
      }
    }

    if (!finalRegionId || !finalRegionId.trim()) {
      throw new BadRequestException('A region or district must be selected.');
    }

    // 5. Language resolution (Auto-create custom language if specified)
    let finalLanguageId: string | null = dto.languageId || null;

    if (dto.customLanguageName && dto.customLanguageName.trim()) {
      const customLang = dto.customLanguageName.trim();
      let existingLang = await this.prisma.language.findFirst({
        where: {
          name: { equals: customLang, mode: 'insensitive' },
        },
      });

      if (!existingLang) {
        existingLang = await this.prisma.language.create({
          data: {
            name: customLang,
            vitalityStatus: 'VULNERABLE',
          },
        });
      }
      finalLanguageId = existingLang.id;
    } else if (finalLanguageId === 'OTHER' || finalLanguageId === 'NONE') {
      finalLanguageId = null;
    }

    const record = await this.prisma.record.create({
      data: {
        mediaType: dto.mediaType,
        mediaUrl: dto.mediaUrl,
        thumbnailUrl: dto.thumbnailUrl,
        regionId: finalRegionId,
        languageId: finalLanguageId || undefined,
        craftId: dto.craftId,
        category: dto.category,
        tags: dto.tags || [],
        speakerName: dto.speakerName,
        speakerAge: dto.speakerAge,
        visibility: dto.visibility || 'PUBLIC',
        transcriptionText:
          dto.transcriptionText?.trim() ||
          (dto.mediaType === 'AUDIO' || dto.mediaType === 'VIDEO'
            ? 'Transcribing audio with AI (Gemini Draft)...'
            : null),
        translationText: dto.translationText?.trim() || null,
        summaryText: dto.summaryText?.trim() || 'Generating cultural summary with AI...',
        verificationStatus: 'UNVERIFIED',
        contributorId: dto.contributorId || undefined,
      },
    });

    // Create accompanying ConsentRecord
    await this.prisma.consentRecord.create({
      data: {
        recordId: record.id,
        consentVersion: 'v1.0',
        scopesGranted: dto.consentScopes || ['PUBLIC_ARCHIVE', 'AI_TRAINING'],
        isAnonymous: dto.isAnonymous || false,
      },
    });

    // Trigger non-blocking asynchronous AI background enrichment job
    console.log(`[AI Worker] Triggering background Gemini enrichment for Record: ${record.id}`);
    setImmediate(() => {
      this.processAiEnrichmentBackground(record.id).catch((err) => {
        console.error(`[AI Worker] Background job error for record ${record.id}:`, err);
      });
    });

    return this.getRecordById(record.id);
  }

  // 3. Search and filter records
  async getRecords(query: RecordFilterQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const where: Prisma.RecordWhereInput = {};

    if (query.regionId) {
      where.OR = [
        { regionId: query.regionId },
        { region: { parentRegionId: query.regionId } },
      ];
    }

    if (query.languageId) {
      where.languageId = query.languageId;
    }

    if (query.craftId) {
      where.craftId = query.craftId;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.mediaType) {
      where.mediaType = query.mediaType;
    }

    if (query.verificationStatus) {
      where.verificationStatus = query.verificationStatus;
    }

    if (query.vitalityStatus) {
      where.region = {
        vitalityStatus: query.vitalityStatus,
      };
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      const searchConditions = [
        { transcriptionText: { contains: searchTerm, mode: 'insensitive' as const } },
        { translationText: { contains: searchTerm, mode: 'insensitive' as const } },
        { summaryText: { contains: searchTerm, mode: 'insensitive' as const } },
        { speakerName: { contains: searchTerm, mode: 'insensitive' as const } },
        { tags: { has: searchTerm } },
      ];

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions },
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // Sorting
    let orderBy: Prisma.RecordOrderByWithRelationInput[] = [{ createdAt: 'desc' }];
    if (query.sort === 'urgency') {
      orderBy = [{ region: { vitalityScore: 'desc' } }, { createdAt: 'desc' }];
    } else if (query.sort === 'verified') {
      orderBy = [{ verificationStatus: 'desc' }, { createdAt: 'desc' }];
    }

    const [total, records] = await Promise.all([
      this.prisma.record.count({ where }),
      this.prisma.record.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
              vitalityStatus: true,
            },
          },
          craft: {
            select: {
              id: true,
              name: true,
              vitalityStatus: true,
            },
          },
        },
      }),
    ]);

    const result = {
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return result;
  }

  // 4. Detailed record with provenance and consent
  async getRecordById(id: string) {
    const record = await this.prisma.record.findUnique({
      where: { id },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            level: true,
            vitalityStatus: true,
            vitalityScore: true,
            parentRegion: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        language: true,
        craft: true,
        consentRecord: true,
        verifications: {
          include: {
            reviewer: {
              select: {
                id: true,
                displayName: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        untranslatableEntries: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Cultural record with id ${id} not found`);
    }

    return record;
  }

  // 5. Live AI Translation with PostgreSQL Database Caching
  async translateRecord(recordId: string, languageCode: string) {
    if (!languageCode || languageCode === 'en') {
      const record = await this.prisma.record.findUnique({ where: { id: recordId } });
      if (!record) throw new NotFoundException(`Record with id ${recordId} not found`);
      return {
        recordId,
        languageCode: 'en',
        translatedTitle: record.summaryText,
        translatedSummary: record.summaryText,
        translatedText: record.translationText,
        translatedTags: record.tags,
        cached: true,
        aiModel: 'original',
      };
    }

    // 1. Check PostgreSQL RecordTranslation table for cached translation
    try {
      const cachedRows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM "RecordTranslation" WHERE "recordId" = $1 AND "languageCode" = $2 LIMIT 1`,
        recordId,
        languageCode
      );

      if (cachedRows && cachedRows.length > 0) {
        const row = cachedRows[0];
        return {
          recordId: row.recordId,
          languageCode: row.languageCode,
          translatedTitle: row.translatedTitle,
          translatedSummary: row.translatedSummary,
          translatedText: row.translatedText,
          translatedTags: row.translatedTags || [],
          aiModel: row.aiModel,
          cached: true,
        };
      }
    } catch (dbErr) {
      console.warn('[RecordTranslation] Error querying cache:', dbErr);
    }

    // 2. Not cached: fetch original record
    const record = await this.prisma.record.findUnique({ where: { id: recordId } });
    if (!record) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    const targetLangNames: Record<string, string> = {
      hi: 'Hindi (हिन्दी)',
      mr: 'Marathi (मराठी)',
      ta: 'Tamil (தமிழ்)',
      bn: 'Bengali (বাংলা)',
    };
    const targetLangName = targetLangNames[languageCode] || languageCode;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[RecordTranslation] GEMINI_API_KEY is not set. Returning original as fallback.');
      return {
        recordId,
        languageCode,
        translatedTitle: record.summaryText,
        translatedSummary: record.summaryText,
        translatedText: record.translationText,
        translatedTags: record.tags,
        aiModel: 'fallback-no-key',
        cached: false,
        isFallback: true,
      };
    }

    // 3. Call Gemini 1.5 Flash
    try {
      const prompt = `You are an expert cultural heritage linguist translating India's living cultural records into ${targetLangName}.
Translate the record fields while respecting cultural context and authentic indigenous terminology:
Record ID: ${record.id}
Title / Summary: "${record.summaryText || ''}"
Detailed Description / Meaning: "${record.translationText || ''}"
Native Transcription: "${record.transcriptionText || ''}"
Tags: ${JSON.stringify(record.tags || [])}

Respond strictly in JSON format with these exact keys:
{
  "translatedTitle": "string",
  "translatedSummary": "string",
  "translatedText": "string",
  "translatedTags": ["string"]
}`;

      const candidateModels = [
        'gemini-flash-latest',
        'gemini-2.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.6-flash',
      ];

      let geminiRes: any = null;
      let usedModel = 'gemini-flash-latest';
      for (const model of candidateModels) {
        try {
          geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': apiKey,
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.2,
                  responseMimeType: 'application/json',
                },
              }),
            }
          );
          usedModel = model;
          if (geminiRes.ok) break;
        } catch (e) {}
      }

      if (!geminiRes || !geminiRes.ok) {
        const errText = geminiRes ? await geminiRes.text() : 'No response';
        console.error('[RecordTranslation] Gemini API error:', geminiRes?.status, errText);
        return {
          recordId,
          languageCode,
          translatedTitle: record.summaryText,
          translatedSummary: record.summaryText,
          translatedText: record.translationText,
          translatedTags: record.tags,
          aiModel: 'gemini-1.5-flash',
          cached: false,
          isFallback: true,
        };
      }

      const geminiData: any = await geminiRes.json();
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(rawText);
      const translatedTitle = parsed.translatedTitle || record.summaryText || '';
      const translatedSummary = parsed.translatedSummary || record.summaryText || '';
      const translatedText = parsed.translatedText || record.translationText || '';
      const translatedTags = Array.isArray(parsed.translatedTags) ? parsed.translatedTags : record.tags || [];

      // 4. Save to PostgreSQL RecordTranslation table
      try {
        const id = randomUUID();
        const tagsLiteral = translatedTags.length > 0
          ? `ARRAY[${translatedTags.map((t: string) => `'${String(t).replace(/'/g, "''")}'`).join(',')}]::TEXT[]`
          : `ARRAY[]::TEXT[]`;

        await this.prisma.$executeRawUnsafe(
          `INSERT INTO "RecordTranslation" ("id", "recordId", "languageCode", "translatedTitle", "translatedSummary", "translatedText", "translatedTags", "aiModel", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, ${tagsLiteral}, 'gemini-1.5-flash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT ("recordId", "languageCode")
           DO UPDATE SET
             "translatedTitle" = EXCLUDED."translatedTitle",
             "translatedSummary" = EXCLUDED."translatedSummary",
             "translatedText" = EXCLUDED."translatedText",
             "translatedTags" = EXCLUDED."translatedTags",
             "updatedAt" = CURRENT_TIMESTAMP`,
          id,
          recordId,
          languageCode,
          translatedTitle,
          translatedSummary,
          translatedText
        );
        console.log(`[RecordTranslation] Cached translation for record ${recordId} in ${languageCode}`);
      } catch (insertErr) {
        console.warn('[RecordTranslation] Failed to cache translation in DB:', insertErr);
      }

      return {
        recordId,
        languageCode,
        translatedTitle,
        translatedSummary,
        translatedText,
        translatedTags,
        aiModel: 'gemini-1.5-flash',
        cached: false,
      };
    } catch (err) {
      console.error('[RecordTranslation] Translation failed, returning fallback:', err);
      return {
        recordId,
        languageCode,
        translatedTitle: record.summaryText,
        translatedSummary: record.summaryText,
        translatedText: record.translationText,
        translatedTags: record.tags,
        aiModel: 'gemini-1.5-flash',
        cached: false,
        isFallback: true,
      };
    }
  }

  // 6. Batch Translation for entire record lists (Archive / Atlas / Home)
  async translateBatch(recordIds: string[], languageCode: string) {
    if (!languageCode || languageCode === 'en' || !Array.isArray(recordIds) || recordIds.length === 0) {
      return {};
    }

    const resultMap: Record<string, any> = {};
    const missingIds: string[] = [];

    // 1. Check existing DB cache for all requested record IDs in this language
    try {
      const inClause = recordIds.map(id => `'${id.replace(/'/g, "''")}'`).join(',');
      const cachedRows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM "RecordTranslation" WHERE "recordId" IN (${inClause}) AND "languageCode" = $1`,
        languageCode
      );

      for (const row of cachedRows) {
        resultMap[row.recordId] = {
          recordId: row.recordId,
          languageCode: row.languageCode,
          translatedTitle: row.translatedTitle,
          translatedSummary: row.translatedSummary,
          translatedText: row.translatedText,
          translatedTags: row.translatedTags || [],
          aiModel: row.aiModel,
          cached: true,
        };
      }
    } catch (err) {
      console.warn('[RecordTranslation] Batch cache query error:', err);
    }

    // Find which IDs are not yet in database cache
    for (const id of recordIds) {
      if (!resultMap[id]) {
        missingIds.push(id);
      }
    }

    if (missingIds.length === 0) {
      return resultMap;
    }

    // 2. If records missing from cache, fetch their originals
    const records = await this.prisma.record.findMany({
      where: { id: { in: missingIds } },
      select: {
        id: true,
        summaryText: true,
        translationText: true,
        transcriptionText: true,
        tags: true,
      },
    });

    const apiKey = process.env.GEMINI_API_KEY;
    const targetLangNames: Record<string, string> = {
      hi: 'Hindi (हिन्दी)',
      mr: 'Marathi (मराठी)',
      ta: 'Tamil (தமிழ்)',
      bn: 'Bengali (বাংলা)',
    };
    const targetLangName = targetLangNames[languageCode] || languageCode;

    if (!apiKey) {
      for (const r of records) {
        resultMap[r.id] = {
          recordId: r.id,
          languageCode,
          translatedTitle: r.summaryText,
          translatedSummary: r.summaryText,
          translatedText: r.translationText,
          translatedTags: r.tags,
          aiModel: 'fallback-no-key',
          cached: false,
          isFallback: true,
        };
      }
      return resultMap;
    }

    // 3. Batch call Gemini 1.5 Flash (in chunks of up to 10 records)
    const chunkSize = 10;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      try {
        const prompt = `You are an expert cultural heritage translator for India's living cultural heritage repository.
Translate the following ${chunk.length} cultural records into ${targetLangName} (${languageCode}).
Preserve cultural nuance, honorifics, and dialect authenticity.
Translate summaryText, translationText (detailed explanation), and tags.
Input records:
${JSON.stringify(chunk.map(r => ({
  id: r.id,
  summaryText: r.summaryText,
  translationText: r.translationText,
  transcriptionText: r.transcriptionText,
  tags: r.tags,
})))}

Respond strictly in valid JSON mapping each record id to its translated object:
{
  "[record_id]": {
    "translatedTitle": "string",
    "translatedSummary": "string",
    "translatedText": "string",
    "translatedTags": ["string"]
  }
}`;

        const candidateModels = [
          'gemini-flash-latest',
          'gemini-2.5-flash-lite',
          'gemini-3.5-flash',
          'gemini-3.6-flash',
        ];

        let geminiRes: any = null;
        let usedBatchModel = 'gemini-flash-latest';
        for (const model of candidateModels) {
          try {
            geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    temperature: 0.2,
                    responseMimeType: 'application/json',
                  },
                }),
              }
            );
            usedBatchModel = model;
            if (geminiRes.ok) break;
          } catch (e) {}
        }

        if (geminiRes.ok) {
          const geminiData: any = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = JSON.parse(rawText || '{}');

          for (const r of chunk) {
            const item = parsed[r.id] || {};
            const translatedTitle = item.translatedTitle || r.summaryText || '';
            const translatedSummary = item.translatedSummary || r.summaryText || '';
            const translatedText = item.translatedText || r.translationText || '';
            const translatedTags = Array.isArray(item.translatedTags) ? item.translatedTags : r.tags || [];

            resultMap[r.id] = {
              recordId: r.id,
              languageCode,
              translatedTitle,
              translatedSummary,
              translatedText,
              translatedTags,
              aiModel: 'gemini-1.5-flash',
              cached: false,
            };

            // Save each into DB cache
            try {
              const tagsLiteral = translatedTags.length > 0
                ? `ARRAY[${translatedTags.map((t: string) => `'${String(t).replace(/'/g, "''")}'`).join(',')}]::TEXT[]`
                : `ARRAY[]::TEXT[]`;

              await this.prisma.$executeRawUnsafe(
                `INSERT INTO "RecordTranslation" ("id", "recordId", "languageCode", "translatedTitle", "translatedSummary", "translatedText", "translatedTags", "aiModel", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, ${tagsLiteral}, 'gemini-1.5-flash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 ON CONFLICT ("recordId", "languageCode")
                 DO UPDATE SET
                   "translatedTitle" = EXCLUDED."translatedTitle",
                   "translatedSummary" = EXCLUDED."translatedSummary",
                   "translatedText" = EXCLUDED."translatedText",
                   "translatedTags" = EXCLUDED."translatedTags",
                   "updatedAt" = CURRENT_TIMESTAMP`,
                randomUUID(),
                r.id,
                languageCode,
                translatedTitle,
                translatedSummary,
                translatedText
              );
            } catch (saveErr) {
              console.warn(`[RecordTranslation] Failed to save DB cache for ${r.id}:`, saveErr);
            }
          }
        } else {
          console.error('[RecordTranslation] Batch Gemini failed with status:', geminiRes.status);
          for (const r of chunk) {
            resultMap[r.id] = {
              recordId: r.id,
              languageCode,
              translatedTitle: r.summaryText,
              translatedSummary: r.summaryText,
              translatedText: r.translationText,
              translatedTags: r.tags,
              aiModel: 'fallback',
              cached: false,
              isFallback: true,
            };
          }
        }
      } catch (chunkErr) {
        console.error('[RecordTranslation] Chunk translation error:', chunkErr);
        for (const r of chunk) {
          resultMap[r.id] = {
            recordId: r.id,
            languageCode,
            translatedTitle: r.summaryText,
            translatedSummary: r.summaryText,
            translatedText: r.translationText,
            translatedTags: r.tags,
            aiModel: 'fallback',
            cached: false,
            isFallback: true,
          };
        }
      }
    }

    return resultMap;
  }

  // 6. Get all records contributed by a user with reviewer feedback & documents
  async getContributorRecords(contributorId: string) {
    if (!contributorId) {
      throw new BadRequestException('contributorId is required');
    }

    return this.prisma.record.findMany({
      where: { contributorId },
      orderBy: { createdAt: 'desc' },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        language: {
          select: {
            id: true,
            name: true,
            scriptName: true,
          },
        },
        verifications: {
          include: {
            reviewer: {
              select: {
                id: true,
                displayName: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  // 7. Contributor resubmission with revisions back to the reviewer queue
  async resubmitRecord(
    recordId: string,
    dto: {
      contributorId: string;
      summaryText?: string;
      transcriptionText?: string;
      translationText?: string;
      resubmissionNotes?: string;
    },
  ) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(`Record with ID ${recordId} not found`);
    }

    if (record.contributorId && record.contributorId !== dto.contributorId) {
      throw new BadRequestException('You do not have permission to edit this record.');
    }

    const updateData: Prisma.RecordUpdateInput = {
      verificationStatus: 'UNVERIFIED',
    };

    if (dto.summaryText !== undefined && dto.summaryText.trim()) {
      updateData.summaryText = dto.summaryText.trim();
    }
    if (dto.transcriptionText !== undefined) {
      updateData.transcriptionText = dto.transcriptionText.trim() || null;
    }
    if (dto.translationText !== undefined) {
      updateData.translationText = dto.translationText.trim() || null;
    }

    const updated = await this.prisma.record.update({
      where: { id: recordId },
      data: updateData,
    });

    return {
      success: true,
      message: 'Record updated and returned to verification queue.',
      record: updated,
    };
  }

  // ==========================================
  // GEMINI AI BACKGROUND WORKER
  // Features:
  // 1. Native Audio Speech-to-Text Transcription (Verbatim + English Translation)
  // 2. Untranslatable Cultural Word Detection (Auto-inserted into UntranslatableEntry)
  // 3. AI Cultural Summary (1-2 sentences for card previews and search)
  // ==========================================

  private async callGeminiApi(contents: any[], responseMimeType?: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[GeminiWorker] GEMINI_API_KEY is not set in environment.');
      return null;
    }

    const candidateModels = [
      'gemini-3-flash-preview',
      'gemini-3.6-flash',
      'gemini-flash-latest',
    ];

    for (const model of candidateModels) {
      try {
        const bodyPayload: any = { contents };
        if (responseMimeType) {
          bodyPayload.generationConfig = {
            temperature: 0.2,
            responseMimeType,
          };
        } else {
          bodyPayload.generationConfig = {
            temperature: 0.3,
          };
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload),
          }
        );

        if (res.ok) {
          const data: any = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return text;
          }
        } else if (res.status === 429) {
          console.warn(`[GeminiWorker] Model ${model} rate-limited (429). Trying next candidate...`);
          await new Promise((r) => setTimeout(r, 1200));
        } else {
          const errBody = await res.text().catch(() => '');
          console.warn(`[GeminiWorker] Model ${model} returned ${res.status}:`, errBody.slice(0, 150));
        }
      } catch (err: any) {
        console.warn(`[GeminiWorker] Error invoking ${model}:`, err.message);
      }
    }

    return null;
  }

  /**
   * Helper to load audio/video file data as base64 and determine mimeType
   */
  private async loadMediaBase64(mediaUrl: string): Promise<{ base64: string; mimeType: string } | null> {
    try {
      let buffer: Buffer | null = null;
      let mimeType = 'audio/webm';

      if (mediaUrl.includes('/uploads/')) {
        const filename = mediaUrl.split('/uploads/').pop()?.split('?')[0];
        if (filename) {
          const diskPath = join(process.cwd(), 'public', 'uploads', filename);
          if (existsSync(diskPath)) {
            buffer = await fs.promises.readFile(diskPath);
            const ext = extname(filename).toLowerCase();
            if (ext === '.mp3') mimeType = 'audio/mpeg';
            else if (ext === '.wav') mimeType = 'audio/wav';
            else if (ext === '.ogg') mimeType = 'audio/ogg';
            else if (ext === '.mp4') mimeType = 'video/mp4';
            else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
            else if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.webp') mimeType = 'image/webp';
            else if (ext === '.gif') mimeType = 'image/gif';
            else mimeType = 'audio/webm';
          }
        }
      }

      // If not on local disk, attempt HTTP fetch if reachable
      if (!buffer && mediaUrl.startsWith('http')) {
        const res = await fetch(mediaUrl);
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          buffer = Buffer.from(arrayBuf);
          const ct = res.headers.get('content-type');
          if (ct) mimeType = ct.split(';')[0];
        }
      }

      if (buffer && buffer.length > 0) {
        // Guard max payload: up to 20MB for direct inlineData
        if (buffer.length <= 20 * 1024 * 1024) {
          return {
            base64: buffer.toString('base64'),
            mimeType,
          };
        }
      }
    } catch (e: any) {
      console.warn('[GeminiWorker] Failed to load media file for transcription:', e.message);
    }
    return null;
  }

  /**
   * Background AI Enrichment Worker (Non-blocking):
   * 1. Generates native oral speech-to-text transcription from audio/video via Gemini.
   * 2. Detects culturally rich untranslatable concepts and inserts into UntranslatableEntry.
   * 3. Generates a concise 1-2 sentence cultural summary for card previews and search.
   */
  async processAiEnrichmentBackground(recordId: string): Promise<void> {
    console.log(`[GeminiWorker] Starting background AI enrichment for Record: ${recordId}`);

    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
      include: {
        region: true,
        language: true,
        untranslatableEntries: true,
      },
    });

    if (!record) {
      console.warn(`[GeminiWorker] Record ${recordId} not found.`);
      return;
    }

    let activeTranscription = record.transcriptionText || '';
    let activeTranslation = record.translationText || '';
    let activeSummary = record.summaryText || '';

    // ----------------------------------------------------
    // 1. AI SPEECH-TO-TEXT TRANSCRIPTION
    // ----------------------------------------------------
    const needsTranscription =
      !activeTranscription ||
      activeTranscription.includes('Transcribing audio with AI') ||
      activeTranscription.trim() === '';

    if (needsTranscription && (record.mediaType === 'AUDIO' || record.mediaType === 'VIDEO') && record.mediaUrl) {
      console.log(`[GeminiWorker] Running native speech-to-text on media: ${record.mediaUrl}`);
      const mediaData = await this.loadMediaBase64(record.mediaUrl);

      if (mediaData) {
        const audioPrompt = `You are an expert native oral linguist transcribing field audio from India.
Target Dialect/Language: ${record.language?.name || 'Regional Indian dialect'}
Region: ${record.region?.name || 'India'}
Category: ${record.category}

Tasks:
1. Transcribe the spoken audio verbatim in its authentic native spoken language and original native script (e.g. Devanagari, Gurmukhi, Tamil, etc.).
2. Provide a faithful English cultural translation of what was spoken.

Respond strictly in JSON format:
{
  "transcription": "verbatim native script words",
  "translation": "accurate English translation"
}`;

        const geminiResult = await this.callGeminiApi(
          [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mediaData.mimeType,
                    data: mediaData.base64,
                  },
                },
                {
                  text: audioPrompt,
                },
              ],
            },
          ],
          'application/json'
        );

        if (geminiResult) {
          try {
            const parsed = JSON.parse(geminiResult);
            if (parsed.transcription && parsed.transcription.trim()) {
              activeTranscription = parsed.transcription.trim();
            }
            if (parsed.translation && parsed.translation.trim() && (!activeTranslation || activeTranslation.includes('pending'))) {
              activeTranslation = parsed.translation.trim();
            }

            await this.prisma.record.update({
              where: { id: recordId },
              data: {
                transcriptionText: activeTranscription,
                translationText: activeTranslation || record.translationText,
              },
            });
            console.log(`[GeminiWorker] AI Draft transcription successfully saved for ${recordId}`);
          } catch (e) {
            console.warn('[GeminiWorker] Failed to parse JSON transcription response:', e);
          }
        } else {
          console.warn('[GeminiWorker] AI Transcription call timed out or failed. Leaving placeholder gracefully.');
        }
      } else {
        console.warn(`[GeminiWorker] Media buffer unavailable for ${record.mediaUrl}`);
      }
    }

    // ----------------------------------------------------
    // 1B. AI MULTIMODAL VISION ANALYSIS (FOR IMAGE RECORDS)
    // ----------------------------------------------------
    if (needsTranscription && record.mediaType === 'IMAGE' && record.mediaUrl) {
      console.log(`[GeminiWorker] Running multimodal vision analysis on image media: ${record.mediaUrl}`);
      const mediaData = await this.loadMediaBase64(record.mediaUrl);

      if (mediaData) {
        const visionPrompt = `You are an expert cultural heritage archaeologist, art historian, and ethnographer analyzing field photography from India.
Tagged Contribution Reference:
- Contributor Selected Region: ${record.region?.name || 'India'}
- Dialect/Language Reference: ${record.language?.name || 'Regional Indian heritage'}
- Category / Tradition Genre: ${record.category}
- Contributor Notes: ${record.summaryText || 'Field photographic artifact'}

Primary Visual Objective:
Analyze the actual visual evidence in the photograph first (monument structure, geological features, temple typology, fort architecture, deity idols, motifs, attire, or craftsmanship) to identify the authentic monument, heritage site, and true geographic location in India. Even if the contributor's tagged region differs, identify the true landmark (for example, Harishchandreshwar temple at Harishchandragad fort in Ahilyanagar / Ahmednagar district, Maharashtra, or Daitya Sudan temple in Lonar, etc.).

Tasks:
1. In "transcription" (Iconography, Inscriptions & Architecture):
   - Identify the specific monument/temple/craft shown, its architectural style (e.g. Hemadpanti / Yadava dynasty stone masonry), shikhara, sanctum, deities (e.g. Ganesha with orange sindoor/vermilion), and sacred symbols (e.g. Bhagwa saffron flag).
   - If ANY native script, inscriptions, stone edicts, or calligraphy are visible in the image, transcribe them faithfully in their original native script (Devanagari, Tamil, etc.).
2. In "translation" (Cultural Interpretation & True Location):
   - State the authentic geographic district, historical dynasty, and cultural context of this heritage site (e.g., Harishchandragad in Ahilyanagar district, Maharashtra).
   - Provide a rich, respectful English ethnographic explanation of the living traditions, sacred rituals, community veneration, and folklore associated with this site.

Respond strictly in JSON format:
{
  "transcription": "Detailed visual iconography, exact temple name, Hemadpanti architecture, deities, and motifs",
  "translation": "Authentic location (district and state), historical dynasty, and living cultural significance"
}`;

        const geminiResult = await this.callGeminiApi(
          [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mediaData.mimeType,
                    data: mediaData.base64,
                  },
                },
                {
                  text: visionPrompt,
                },
              ],
            },
          ],
          'application/json'
        );

        if (geminiResult) {
          try {
            const parsed = JSON.parse(geminiResult);
            if (parsed.transcription && parsed.transcription.trim()) {
              activeTranscription = parsed.transcription.trim();
            }
            if (parsed.translation && parsed.translation.trim()) {
              activeTranslation = parsed.translation.trim();
            }

            await this.prisma.record.update({
              where: { id: recordId },
              data: {
                transcriptionText: activeTranscription,
                translationText: activeTranslation || record.translationText,
              },
            });
            console.log(`[GeminiWorker] AI Multimodal Vision analysis successfully saved for Record ${recordId}`);
          } catch (e) {
            console.warn('[GeminiWorker] Failed to parse JSON vision response:', e);
          }
        } else {
          console.warn('[GeminiWorker] Gemini Vision call returned empty or timed out.');
        }
      } else {
        console.warn(`[GeminiWorker] Image media buffer unavailable for ${record.mediaUrl}`);
      }
    }

    // ----------------------------------------------------
    // 2. AI SUMMARY GENERATION (1-2 Sentences for Previews & Search)
    // ----------------------------------------------------
    const isShortOrPlaceholderSummary =
      !activeSummary ||
      activeSummary.includes('Generating cultural summary') ||
      activeSummary.trim().endsWith('—') ||
      activeSummary.trim().length < 20;

    const isLongStoryWithBriefTitle =
      activeTranscription.length > 80 &&
      (!activeSummary.includes('—') || (activeSummary.split('—')[1] || '').trim().length < 15);

    const needsSummary = isShortOrPlaceholderSummary || isLongStoryWithBriefTitle;

    if (needsSummary && (activeTranscription || activeTranslation || record.speakerName)) {
      console.log(`[GeminiWorker] Generating concise cultural summary for ${recordId}`);
      const summaryPrompt = `Generate a concise 1-2 sentence cultural summary of this oral knowledge record suitable for an encyclopedia archive card preview and search snippet:
Category: "${record.category}"
Region: "${record.region?.name || 'India'}"
Language: "${record.language?.name || 'Native dialect'}"
Speaker: "${record.speakerName || 'Elder custodian'}"
Existing Title/Hint: "${activeSummary || ''}"
Native Transcription: "${activeTranscription.slice(0, 500)}"
Translation / Meaning: "${activeTranslation.slice(0, 500)}"

Return strictly the 1-2 sentence English summary.`;

      const summaryText = await this.callGeminiApi([
        {
          parts: [{ text: summaryPrompt }],
        },
      ]);

      if (summaryText && summaryText.trim()) {
        activeSummary = summaryText.trim().replace(/^["']|["']$/g, '');
        await this.prisma.record.update({
          where: { id: recordId },
          data: {
            summaryText: activeSummary,
          },
        });
        console.log(`[GeminiWorker] AI Summary saved for ${recordId}: "${activeSummary}"`);
      }
    }

    // Pacing delay to avoid rate limit spikes on Gemini Free Tier
    await new Promise((r) => setTimeout(r, 1200));

    // ----------------------------------------------------
    // 3. UNTRANSLATABLE WORD DETECTION & AUTO-INSERTION
    // ----------------------------------------------------
    const existingUntranslatableCount = await this.prisma.untranslatableEntry.count({
      where: { recordId },
    });

    if (existingUntranslatableCount === 0 && (activeTranscription || activeTranslation)) {
      console.log(`[GeminiWorker] Detecting untranslatable cultural terms for ${recordId}`);
      const untranslatablePrompt = `You are an expert ethnolinguist analyzing Indian indigenous folklore and oral culture.
Analyze this transcription and translation:
Language: "${record.language?.name || 'Regional Indian dialect'}"
Region: "${record.region?.name || 'India'}"
Category: "${record.category}"
Native Transcription: "${activeTranscription.slice(0, 500)}"
Translation / Meaning: "${activeTranslation.slice(0, 500)}"

Identify 1 to 3 culturally rich words, idioms, or expressions that have NO direct 1-to-1 English or Hindi equivalent (e.g. concepts of kinship, seasonal rituals, artisan techniques, emotion, or sacred duty).

Respond strictly in JSON format matching this array schema:
[
  {
    "term": "Native term in Roman or native script",
    "script": "Native script spelling (e.g. देवनागरी, தமிழ், etc.)",
    "phonetic": "Phonetic romanization / IAST",
    "literalMeaning": "Literal English word breakdown",
    "explanation": "1-2 sentence cultural explanation of why this concept cannot be cleanly translated without losing its cultural depth."
  }
]
If there are no distinct untranslatable words, return [].`;

      const untranslatableJson = await this.callGeminiApi(
        [
          {
            parts: [{ text: untranslatablePrompt }],
          },
        ],
        'application/json'
      );

      if (untranslatableJson) {
        try {
          const terms = JSON.parse(untranslatableJson);
          if (Array.isArray(terms) && terms.length > 0) {
            for (const item of terms) {
              if (item.term && item.explanation) {
                await this.prisma.untranslatableEntry.create({
                  data: {
                    recordId,
                    term: String(item.term).trim(),
                    script: item.script ? String(item.script).trim() : null,
                    phonetic: item.phonetic ? String(item.phonetic).trim() : null,
                    literalMeaning: item.literalMeaning ? String(item.literalMeaning).trim() : null,
                    explanation: String(item.explanation).trim(),
                    isFeatured: false,
                  },
                });
              }
            }
            console.log(`[GeminiWorker] Persisted ${terms.length} untranslatable terms for record ${recordId}`);
          }
        } catch (err) {
          console.warn('[GeminiWorker] Failed to parse untranslatable terms JSON:', err);
        }
      }
    }

    console.log(`[GeminiWorker] Completed AI enrichment for record ${recordId}`);
  }

  /**
   * Manual trigger endpoint to run AI enrichment on demand
   */
  async triggerAiEnrichment(recordId: string) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
    });
    if (!record) {
      throw new NotFoundException(`Record ${recordId} not found`);
    }

    // Run asynchronously
    setImmediate(() => {
      this.processAiEnrichmentBackground(recordId).catch((err) => {
        console.error(`[GeminiWorker] Manual trigger error for ${recordId}:`, err);
      });
    });

    return {
      success: true,
      message: 'AI enrichment background job triggered for record.',
      recordId,
    };
  }

  /**
   * Delete Record:
   * Accessible by ADMIN, REVIEWER, STEWARD, EXPERT, or the record's original author.
   * Cascade deletes associated translations, consent records, verification logs, and untranslatable entries.
   * Removes local media files from disk if applicable.
   */
  async deleteRecord(recordId: string, userId?: string, role?: string) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
      include: { contributor: true },
    });

    if (!record) {
      throw new NotFoundException(`Record with ID ${recordId} not found`);
    }

    // Role verification: STRICTLY only ADMIN or REVIEWER/STEWARD/EXPERT (verifier) can delete records
    let authorized = false;
    const normalizedRole = (role || '').toUpperCase();

    if (['ADMIN', 'REVIEWER', 'STEWARD', 'EXPERT'].includes(normalizedRole)) {
      authorized = true;
    } else if (userId) {
      const user = await this.prisma.contributor.findUnique({ where: { id: userId } });
      if (user && ['ADMIN', 'REVIEWER', 'STEWARD', 'EXPERT'].includes(user.role)) {
        authorized = true;
      }
    }

    if (!authorized) {
      throw new ForbiddenException('Access denied: Only administrators or verifiers/reviewers can delete records from the archives.');
    }

    // Delete local media file from disk if present
    if (record.mediaUrl && record.mediaUrl.includes('/uploads/')) {
      const filename = record.mediaUrl.split('/uploads/').pop()?.split('?')[0];
      if (filename) {
        const diskPath = join(process.cwd(), 'public', 'uploads', filename);
        if (existsSync(diskPath)) {
          try {
            fs.unlinkSync(diskPath);
            console.log(`[RecordsService] Deleted local upload file: ${diskPath}`);
          } catch (e: any) {
            console.warn(`[RecordsService] Could not remove file ${diskPath}:`, e.message);
          }
        }
      }
    }

    // Cascade delete in Prisma (RecordTranslation, ConsentRecord, VerificationLog, UntranslatableEntry are all cascade)
    await this.prisma.record.delete({
      where: { id: recordId },
    });

    console.log(`[RecordsService] Record ${recordId} permanently deleted.`);

    return {
      success: true,
      message: 'Record permanently deleted from archives.',
      id: recordId,
    };
  }
}

