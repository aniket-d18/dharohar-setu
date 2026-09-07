import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { serverCache } from '../../common/cache.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // 1. Live Counters for Homepage
  async getLiveCounters() {
    const cacheKey = 'analytics:live_counters';
    const cached = serverCache.get(cacheKey);
    if (cached) return cached;

    const [
      totalRecords,
      totalLanguages,
      verifiedRecords,
      totalContributors,
      regionsWithRecords,
    ] = await Promise.all([
      // Total records in database
      this.prisma.record.count(),

      // Total languages represented
      this.prisma.language.count(),

      // Verified records: strictly records with verified logs in VerificationLog
      this.prisma.record.count({
        where: {
          verifications: {
            some: {
              action: {
                in: ['AGREE', 'ENDORSE'],
              },
            },
          },
        },
      }),

      // Total registered contributors: strictly count rows in Contributor table
      this.prisma.contributor.count(),

      // Distinct regions with at least one record
      this.prisma.record.groupBy({
        by: ['regionId'],
      }),
    ]);

    const result = {
      totalRecords,
      totalLanguages,
      verifiedRecords,
      totalContributors,
      regionsCovered: regionsWithRecords.length,
    };

    serverCache.set(cacheKey, result, 30 * 1000); // 30s TTL
    return result;
  }

  // 2. Endangered Heritage Dashboard Analytics
  async getDashboardAnalytics() {
    const cacheKey = 'analytics:dashboard';
    const cached = serverCache.get(cacheKey);
    if (cached) return cached;

    const [
      criticalRegions,
      languagesProjection,
      categoryCounts,
      mediaTypeCounts,
      vitalityRegionCounts,
    ] = await Promise.all([
      // Critical regions and their record density / preservation gaps
      this.prisma.region.findMany({
        where: {
          level: 'DISTRICT',
          vitalityStatus: 'CRITICAL',
        },
        select: {
          id: true,
          name: true,
          vitalityStatus: true,
          vitalityScore: true,
          parentRegion: {
            select: {
              name: true,
            },
          },
          languages: {
            include: {
              language: {
                select: {
                  name: true,
                  estimatedSpeakers: true,
                  yearsToCritical: true,
                },
              },
            },
          },
          _count: {
            select: {
              records: true,
            },
          },
        },
        orderBy: {
          vitalityScore: 'desc',
        },
      }),

      // Languages projected timeline to extinction / critical
      this.prisma.language.findMany({
        orderBy: [
          { yearsToCritical: 'asc' },
          { estimatedSpeakers: 'asc' },
        ],
        select: {
          id: true,
          name: true,
          estimatedSpeakers: true,
          averageSpeakerAge: true,
          vitalityStatus: true,
          yearsToCritical: true,
          _count: {
            select: {
              records: true,
            },
          },
        },
      }),

      // Category breakdown
      this.prisma.record.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
      }),

      // Media type breakdown
      this.prisma.record.groupBy({
        by: ['mediaType'],
        _count: {
          id: true,
        },
      }),

      // Vitality distribution of regions
      this.prisma.region.groupBy({
        by: ['vitalityStatus'],
        _count: {
          id: true,
        },
      }),
    ]);

    const dashboardResult = {
      criticalRegions: criticalRegions.map(r => ({
        id: r.id,
        name: r.name,
        state: r.parentRegion?.name || 'Unknown',
        vitalityStatus: r.vitalityStatus,
        vitalityScore: r.vitalityScore,
        recordCount: r._count.records,
        isPreservationGap: r._count.records === 0,
        endangeredLanguages: r.languages.map(l => l.language.name),
      })),
      languagesProjection,
      categoryDistribution: categoryCounts.map(c => ({
        category: c.category,
        count: c._count.id,
      })),
      mediaTypeDistribution: mediaTypeCounts.map(m => ({
        mediaType: m.mediaType,
        count: m._count.id,
      })),
      vitalityDistribution: vitalityRegionCounts.map(v => ({
        status: v.vitalityStatus,
        regionCount: v._count.id,
      })),
    };

    serverCache.set(cacheKey, dashboardResult, 60 * 1000); // 60s TTL
    return dashboardResult;
  }
}
