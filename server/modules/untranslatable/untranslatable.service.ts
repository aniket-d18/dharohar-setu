import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { serverCache } from '../../common/cache.service';

@Injectable()
export class UntranslatableService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async getAll(featuredOnly?: boolean, search?: string) {
    const cacheKey = `untranslatable:all:${featuredOnly}:${search || ''}`;
    const cached = serverCache.get(cacheKey);
    if (cached) return cached;

    const where: any = {};
    if (featuredOnly) {
      where.isFeatured = true;
    }
    if (search) {
      where.OR = [
        { term: { contains: search, mode: 'insensitive' } },
        { phonetic: { contains: search, mode: 'insensitive' } },
        { literalMeaning: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } },
      ];
    }

    const data = await this.prisma.untranslatableEntry.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        record: {
          select: {
            id: true,
            mediaType: true,
            category: true,
            region: {
              select: {
                id: true,
                name: true,
                vitalityStatus: true,
              },
            },
            language: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    serverCache.set(cacheKey, data, 15 * 60 * 1000); // 15 mins
    return data;
  }

  async getDiscoveryOfTheDay() {
    const cacheKey = 'untranslatable:discovery-of-the-day';
    const cached = serverCache.get(cacheKey);
    if (cached) return cached;

    // Consolidated single query using composite index (isFeatured DESC, createdAt DESC)
    const data = await this.prisma.untranslatableEntry.findFirst({
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        record: {
          select: {
            id: true,
            mediaType: true,
            mediaUrl: true,
            thumbnailUrl: true,
            category: true,
            speakerName: true,
            region: {
              select: {
                id: true,
                name: true,
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
          },
        },
      },
    });

    serverCache.set(cacheKey, data, 15 * 60 * 1000); // 15 mins
    return data;
  }

  async getById(id: string) {
    const entry = await this.prisma.untranslatableEntry.findUnique({
      where: { id },
      include: {
        record: {
          include: {
            region: true,
            language: true,
          },
        },
      },
    });
    if (!entry) {
      throw new NotFoundException(`Untranslatable entry ${id} not found`);
    }
    return entry;
  }
}
