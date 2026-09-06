import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [RecordsController],
  providers: [RecordsService, PrismaService],
  exports: [RecordsService],
})
export class RecordsModule {}
