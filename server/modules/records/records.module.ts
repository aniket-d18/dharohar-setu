import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { PrismaService } from '../../prisma.service';
import { StorageService } from '../../common/storage.service';

@Module({
  controllers: [RecordsController],
  providers: [RecordsService, PrismaService, StorageService],
  exports: [RecordsService, StorageService],
})
export class RecordsModule {}
