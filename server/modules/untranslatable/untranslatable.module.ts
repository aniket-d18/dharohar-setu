import { Module } from '@nestjs/common';
import { UntranslatableController } from './untranslatable.controller';
import { UntranslatableService } from './untranslatable.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [UntranslatableController],
  providers: [UntranslatableService, PrismaService],
  exports: [UntranslatableService],
})
export class UntranslatableModule {}
