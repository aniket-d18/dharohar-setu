import { Module } from '@nestjs/common';
import { RegionsLanguagesController } from './regions-languages.controller';
import { RegionsLanguagesService } from './regions-languages.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [RegionsLanguagesController],
  providers: [RegionsLanguagesService, PrismaService],
  exports: [RegionsLanguagesService],
})
export class RegionsLanguagesModule {}
