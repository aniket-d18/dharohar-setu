import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RegionsLanguagesModule } from './modules/regions-languages/regions-languages.module';
import { RecordsModule } from './modules/records/records.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { UntranslatableModule } from './modules/untranslatable/untranslatable.module';
import { VerificationModule } from './modules/verification/verification.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 60 seconds
        limit: 120, // 120 requests per minute per IP globally
      },
    ]),
    HealthModule,
    RegionsLanguagesModule,
    RecordsModule,
    AnalyticsModule,
    UntranslatableModule,
    VerificationModule,
    AuthModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
