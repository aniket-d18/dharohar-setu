import { Module } from '@nestjs/common';
import { RegionsLanguagesModule } from './modules/regions-languages/regions-languages.module';
import { RecordsModule } from './modules/records/records.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { UntranslatableModule } from './modules/untranslatable/untranslatable.module';
import { VerificationModule } from './modules/verification/verification.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    RegionsLanguagesModule,
    RecordsModule,
    AnalyticsModule,
    UntranslatableModule,
    VerificationModule,
    AuthModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

