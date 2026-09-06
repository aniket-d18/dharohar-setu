import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    // Retry connection up to 3 times with backoff for transient Supabase pooler timeouts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.$connect();
        console.log(`[PrismaService] Database connected on attempt ${attempt}.`);
        break;
      } catch (err: any) {
        console.warn(`[PrismaService] Connection attempt ${attempt}/3 failed:`, err.message);
        if (attempt === 3) {
          console.error('[PrismaService] All connection attempts exhausted. Starting without DB — API calls will fail gracefully.');
          return;
        }
        await new Promise(r => setTimeout(r, attempt * 2000));
      }
    }

    // Run lightweight idempotent migrations — these are best-effort and non-fatal
    try {
      await this.$executeRawUnsafe(`ALTER TABLE "VerificationLog" ADD COLUMN IF NOT EXISTS "documentUrl" TEXT`);
      await this.$executeRawUnsafe(`ALTER TABLE "VerificationLog" ADD COLUMN IF NOT EXISTS "documentName" TEXT`);
      console.log('[PrismaService] Schema migrations verified.');
    } catch (err) {
      console.warn('[PrismaService] DDL migration note (non-fatal):', (err as Error).message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
