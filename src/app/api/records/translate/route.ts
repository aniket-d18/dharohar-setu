import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let tableInitialized = false;

// Ensure RecordTranslation table exists in PostgreSQL without requiring CLI migrations
async function ensureTable() {
  if (tableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RecordTranslation" (
        "id" TEXT NOT NULL,
        "recordId" TEXT NOT NULL,
        "languageCode" TEXT NOT NULL,
        "translatedTitle" TEXT,
        "translatedSummary" TEXT,
        "translatedText" TEXT,
        "translatedTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "aiModel" TEXT NOT NULL DEFAULT 'gemini-flash-latest',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RecordTranslation_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "RecordTranslation_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "RecordTranslation_recordId_languageCode_key" ON "RecordTranslation"("recordId", "languageCode")
    `).catch(() => {});
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "RecordTranslation_recordId_languageCode_idx" ON "RecordTranslation"("recordId", "languageCode")
    `).catch(() => {});
    tableInitialized = true;
    console.log('[Translate API] RecordTranslation table verified/initialized in database.');
  } catch (e) {
    console.warn('[Translate API] Notice during table verification:', e);
  }
}

// Clean JSON response from Gemini if wrapped in markdown code fence
function cleanJson(rawText: string) {
  let cleaned = (rawText || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// Call Google Gemini with gemini-flash-latest and graceful fallback models
async function queryGemini(apiKey: string, promptText: string) {
  const candidateModels = [
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
  ];

  let lastError = '';

  for (const model of candidateModels) {
    try {
      console.log(`[Translate API] Calling Gemini model ${model}...`);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          console.log(`[Translate API] Successfully received translation from model: ${model}`);
          return { model, rawText };
        }
      } else {
        const errText = await res.text();
        console.warn(`[Translate API] Model ${model} returned HTTP ${res.status}: ${errText}`);
        lastError = `${model} returned ${res.status}: ${errText}`;
      }
    } catch (err: any) {
      console.warn(`[Translate API] Exception connecting to model ${model}:`, err?.message);
      lastError = `${model} exception: ${err?.message}`;
    }
  }

  throw new Error(`All Gemini candidate models failed. Last error: ${lastError}`);
}

export async function GET(req: Request) {
  try {
    await ensureTable();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env' }, { status: 500 });
    }

    const { model, rawText } = await queryGemini(
      apiKey,
      'Translate "Ancient Folk Melody" to Marathi (मराठी). Respond strictly as JSON: {"translatedTitle": "string", "translatedSummary": "string"}'
    );

    return NextResponse.json({
      success: true,
      model,
      data: cleanJson(rawText),
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err?.message }, { status: 500 });
  }
}

const TARGET_LANG_NAMES: Record<string, string> = {
  hi: 'Hindi (हिन्दी)',
  mr: 'Marathi (मराठी)',
  ta: 'Tamil (தமிழ்)',
  bn: 'Bengali (বাংলা)',
  en: 'English',
};

export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = await req.json();
    const { recordId, recordIds, languageCode } = body;

    if (!languageCode) {
      return NextResponse.json({ error: 'languageCode is required' }, { status: 400 });
    }

    // 1. If English, return immediately with original content
    if (languageCode === 'en') {
      if (recordId) {
        const record = await prisma.record.findUnique({ where: { id: recordId } });
        return NextResponse.json({
          recordId,
          languageCode: 'en',
          translatedTitle: record?.summaryText || '',
          translatedSummary: record?.summaryText || '',
          translatedText: record?.translationText || '',
          translatedTags: record?.tags || [],
          cached: true,
          aiModel: 'original',
        });
      }
      return NextResponse.json({});
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`[Translate API] Request for lang: ${languageCode}. Has API key: ${Boolean(apiKey)}`);

    // 2. Single Record Translation
    if (recordId) {
      // Step A: Check PostgreSQL DB cache first
      try {
        const cachedRows: any[] = await prisma.$queryRawUnsafe(
          `SELECT * FROM "RecordTranslation" WHERE "recordId" = $1 AND "languageCode" = $2 LIMIT 1`,
          recordId,
          languageCode
        );

        if (cachedRows && cachedRows.length > 0) {
          const row = cachedRows[0];
          console.log(`[Translate API] PostgreSQL Cache HIT for record: ${recordId} [${languageCode}]`);
          return NextResponse.json({
            recordId: row.recordId,
            languageCode: row.languageCode,
            translatedTitle: row.translatedTitle,
            translatedSummary: row.translatedSummary,
            translatedText: row.translatedText,
            translatedTags: row.translatedTags || [],
            aiModel: row.aiModel,
            cached: true,
          });
        }
      } catch (cacheErr) {
        console.warn('[Translate API] DB cache lookup notice:', cacheErr);
      }

      // Step B: Cache miss -> Fetch original record from database
      const record = await prisma.record.findUnique({
        where: { id: recordId },
        select: {
          id: true,
          summaryText: true,
          translationText: true,
          transcriptionText: true,
          tags: true,
        },
      });

      if (!record) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      if (!apiKey) {
        console.warn('[Translate API] GEMINI_API_KEY not set in .env. Returning fallback.');
        return NextResponse.json({
          recordId,
          languageCode,
          translatedTitle: record.summaryText,
          translatedSummary: record.summaryText,
          translatedText: record.translationText,
          translatedTags: record.tags,
          aiModel: 'fallback-no-key',
          cached: false,
          isFallback: true,
        });
      }

      // Step C: Call Google Gemini (gemini-flash-latest)
      const targetLangName = TARGET_LANG_NAMES[languageCode] || languageCode;
      const prompt = `You are an expert cultural heritage translator for India's living cultural heritage repository (Dharohar Setu).
Translate the following cultural record into ${targetLangName} (${languageCode}).
Preserve cultural nuance, honorifics, and dialect authenticity.
Input:
Title / Summary: "${record.summaryText || ''}"
Detailed Description: "${record.translationText || ''}"
Native Oral Transcription: "${record.transcriptionText || ''}"
Tags: ${JSON.stringify(record.tags || [])}

Respond strictly in valid JSON format with these exact keys:
{
  "translatedTitle": "string",
  "translatedSummary": "string",
  "translatedText": "string",
  "translatedTags": ["string"]
}`;

      try {
        const { model: usedModel, rawText } = await queryGemini(apiKey, prompt);
        const parsed = cleanJson(rawText);

        const translatedTitle = parsed.translatedTitle || record.summaryText || '';
        const translatedSummary = parsed.translatedSummary || record.summaryText || '';
        const translatedText = parsed.translatedText || record.translationText || '';
        const translatedTags = Array.isArray(parsed.translatedTags) ? parsed.translatedTags : record.tags || [];

        // Step D: Insert into PostgreSQL RecordTranslation table for persistent caching
        try {
          const id = randomUUID();
          const tagsLiteral = translatedTags.length > 0
            ? `ARRAY[${translatedTags.map((t: string) => `'${String(t).replace(/'/g, "''")}'`).join(',')}]::TEXT[]`
            : `ARRAY[]::TEXT[]`;

          await prisma.$executeRawUnsafe(
            `INSERT INTO "RecordTranslation" ("id", "recordId", "languageCode", "translatedTitle", "translatedSummary", "translatedText", "translatedTags", "aiModel", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, ${tagsLiteral}, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON CONFLICT ("recordId", "languageCode")
             DO UPDATE SET
               "translatedTitle" = EXCLUDED."translatedTitle",
               "translatedSummary" = EXCLUDED."translatedSummary",
               "translatedText" = EXCLUDED."translatedText",
               "translatedTags" = EXCLUDED."translatedTags",
               "aiModel" = EXCLUDED."aiModel",
               "updatedAt" = CURRENT_TIMESTAMP`,
            id,
            recordId,
            languageCode,
            translatedTitle,
            translatedSummary,
            translatedText,
            usedModel
          );
          console.log(`[Translate API] Persisted translation into PostgreSQL for record ${recordId} [${languageCode}] using ${usedModel}`);
        } catch (dbSaveErr) {
          console.warn('[Translate API] DB save error (will still return translation):', dbSaveErr);
        }

        return NextResponse.json({
          recordId,
          languageCode,
          translatedTitle,
          translatedSummary,
          translatedText,
          translatedTags,
          aiModel: usedModel,
          cached: false,
        });
      } catch (geminiErr: any) {
        console.error('[Translate API] Gemini exception:', geminiErr?.message);
        return NextResponse.json({
          recordId,
          languageCode,
          translatedTitle: record.summaryText,
          translatedSummary: record.summaryText,
          translatedText: record.translationText,
          translatedTags: record.tags,
          aiModel: 'fallback',
          cached: false,
          isFallback: true,
          error: geminiErr?.message,
        });
      }
    }

    // 3. Batch Translation for Record IDs
    if (recordIds && Array.isArray(recordIds) && recordIds.length > 0) {
      const resultMap: Record<string, any> = {};
      const inClause = recordIds.map(id => `'${String(id).replace(/'/g, "''")}'`).join(',');

      try {
        const cachedRows: any[] = await prisma.$queryRawUnsafe(
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
      } catch (e) {
        console.warn('[Translate API] Batch cache query notice:', e);
      }

      const missingIds = recordIds.filter(id => !resultMap[id]);
      if (missingIds.length === 0 || !apiKey) {
        return NextResponse.json(resultMap);
      }

      // Fetch missing records from DB and translate in chunks of 5
      const records = await prisma.record.findMany({
        where: { id: { in: missingIds } },
        select: { id: true, summaryText: true, translationText: true, transcriptionText: true, tags: true },
      });

      const targetLangName = TARGET_LANG_NAMES[languageCode] || languageCode;
      const chunkSize = 5;
      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const prompt = `You are an expert cultural heritage translator for India's living cultural heritage repository.
Translate the following ${chunk.length} records into ${targetLangName} (${languageCode}).
Input:
${JSON.stringify(chunk.map(r => ({ id: r.id, summary: r.summaryText, description: r.translationText, tags: r.tags })))}

Respond strictly in valid JSON mapping each record id:
{
  "[record_id]": {
    "translatedTitle": "string",
    "translatedSummary": "string",
    "translatedText": "string",
    "translatedTags": ["string"]
  }
}`;

        try {
          const { model: usedModel, rawText } = await queryGemini(apiKey, prompt);
          const parsed = cleanJson(rawText);

          for (const r of chunk) {
            const item = parsed[r.id] || {};
            const title = item.translatedTitle || r.summaryText || '';
            const summary = item.translatedSummary || r.summaryText || '';
            const desc = item.translatedText || r.translationText || '';
            const tags = Array.isArray(item.translatedTags) ? item.translatedTags : r.tags || [];

            resultMap[r.id] = {
              recordId: r.id,
              languageCode,
              translatedTitle: title,
              translatedSummary: summary,
              translatedText: desc,
              translatedTags: tags,
              aiModel: usedModel,
              cached: false,
            };

            // Cache in PostgreSQL
            try {
              const tagsLit = tags.length > 0
                ? `ARRAY[${tags.map((t: string) => `'${String(t).replace(/'/g, "''")}'`).join(',')}]::TEXT[]`
                : `ARRAY[]::TEXT[]`;
              await prisma.$executeRawUnsafe(
                `INSERT INTO "RecordTranslation" ("id", "recordId", "languageCode", "translatedTitle", "translatedSummary", "translatedText", "translatedTags", "aiModel", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, ${tagsLit}, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 ON CONFLICT ("recordId", "languageCode")
                 DO UPDATE SET
                   "translatedTitle" = EXCLUDED."translatedTitle",
                   "translatedSummary" = EXCLUDED."translatedSummary",
                   "translatedText" = EXCLUDED."translatedText",
                   "translatedTags" = EXCLUDED."translatedTags",
                   "aiModel" = EXCLUDED."aiModel",
                   "updatedAt" = CURRENT_TIMESTAMP`,
                randomUUID(),
                r.id,
                languageCode,
                title,
                summary,
                desc,
                usedModel
              );
            } catch (saveErr) {}
          }
        } catch (chunkErr) {
          console.error('[Translate API] Batch chunk error:', chunkErr);
        }
      }

      return NextResponse.json(resultMap);
    }

    return NextResponse.json({ error: 'recordId or recordIds required' }, { status: 400 });
  } catch (globalErr: any) {
    console.error('[Translate API Global Error]:', globalErr);
    return NextResponse.json({ error: globalErr?.message || 'Server translation error' }, { status: 500 });
  }
}
