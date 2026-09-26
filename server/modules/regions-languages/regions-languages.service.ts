import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { serverCache } from '../../common/cache.service';
import { calculateVitalityScore, LanguageVitalityData, scoreToStatus } from '../../common/vitality.calculator';
import { VitalityStatus } from '@prisma/client';

const CACHE_TTL_LONG = 30 * 60 * 1000; // 30 minutes
const CACHE_TTL_MEDIUM = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class RegionsLanguagesService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // 1. Hierarchical regions (State -> Districts)
  async getRegionsHierarchy() {
    const cacheKey = 'regions:hierarchy';
    const cached = serverCache.get(cacheKey);
    if (cached) return cached;

    const data = await this.prisma.region.findMany({
      where: {
        level: 'STATE',
      },
      include: {
        childRegions: {
          include: {
            languages: {
              include: {
                language: true,
              },
            },
            crafts: {
              include: {
                craft: true,
              },
            },
            _count: {
              select: {
                records: true,
              },
            },
          },
        },
        languages: {
          include: {
            language: true,
          },
        },
        _count: {
          select: {
            records: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    serverCache.set(cacheKey, data, CACHE_TTL_LONG);
    return data;
  }

  // 2. GeoJSON boundary for a region
  async getRegionGeoJson(id: string) {
    const cacheKey = `regions:geojson:${id}`;
    const cached = serverCache.get(cacheKey);
    if (cached) return cached;

    const region = await this.prisma.region.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        level: true,
        vitalityStatus: true,
        vitalityScore: true,
        geoJsonData: true,
      },
    });

    if (!region) {
      throw new NotFoundException(`Region with id ${id} not found`);
    }

    const result = region.geoJsonData || {
      type: 'Feature',
      properties: {
        id: region.id,
        name: region.name,
        level: region.level,
        vitalityStatus: region.vitalityStatus,
        vitalityScore: region.vitalityScore,
      },
      geometry: {
        type: 'Point',
        coordinates: [78.9629, 20.5937], // Center of India fallback
      },
    };

    serverCache.set(cacheKey, result, CACHE_TTL_LONG);
    return result;
  }

  // 3. Fading fastest languages (sorted by yearsToCritical ascending or CRITICAL status)
  async getFadingFastestLanguages(limit: number = 5) {
    const cacheKey = `languages:fading:${limit}`;
    const cached = serverCache.get(cacheKey);
    if (cached) return cached;

    const data = await this.prisma.language.findMany({
      where: {
        vitalityStatus: {
          in: ['CRITICAL', 'ENDANGERED'],
        },
      },
      orderBy: [
        { yearsToCritical: 'asc' },
        { estimatedSpeakers: 'asc' },
      ],
      take: limit,
      include: {
        regions: {
          include: {
            region: {
              select: {
                id: true,
                name: true,
                level: true,
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
    });

    serverCache.set(cacheKey, data, CACHE_TTL_MEDIUM);
    return data;
  }

  // 4. Crafts list with vitality scores and regions
  async getCrafts() {
    const cacheKey = 'crafts:all';
    const cached = serverCache.get(cacheKey);
    if (cached) return cached;

    const data = await this.prisma.craft.findMany({
      orderBy: [
        { vitalityStatus: 'desc' },
        { estimatedPractitioners: 'asc' },
      ],
      include: {
        regions: {
          include: {
            region: {
              select: {
                id: true,
                name: true,
                level: true,
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
    });

    serverCache.set(cacheKey, data, CACHE_TTL_LONG);
    return data;
  }

  // 5. All registered native languages in database
  async getAllLanguages() {
    const cacheKey = 'languages:all';
    const cached = serverCache.get(cacheKey);
    if (cached) return cached;

    const data = await this.prisma.language.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            records: true,
          },
        },
      },
    });

    serverCache.set(cacheKey, data, CACHE_TTL_LONG);
    return data;
  }

  // 6. Recalculate vitality score and status for a specific region
  async recalculateRegionVitality(regionId: string) {
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
      include: {
        languages: {
          include: { language: true },
        },
        childRegions: {
          include: {
            languages: {
              include: { language: true },
            },
            _count: {
              select: { records: true },
            },
          },
        },
        records: {
          include: { language: true },
        },
        _count: {
          select: { records: true },
        },
      },
    });

    if (!region) return null;

    // Aggregate linked languages across region, child districts, and actual records
    const langMap = new Map<string, LanguageVitalityData>();
    for (const rl of region.languages) {
      if (rl.language) langMap.set(rl.language.id, rl.language);
    }
    for (const child of region.childRegions) {
      for (const crl of child.languages) {
        if (crl.language) langMap.set(crl.language.id, crl.language);
      }
    }
    for (const rec of region.records) {
      if (rec.language) langMap.set(rec.language.id, rec.language);
    }

    // If district has no directly linked languages, check parent state
    if (langMap.size === 0 && region.parentRegionId) {
      const parent = await this.prisma.region.findUnique({
        where: { id: region.parentRegionId },
        include: {
          languages: { include: { language: true } },
        },
      });
      if (parent) {
        for (const pl of parent.languages) {
          if (pl.language) langMap.set(pl.language.id, pl.language);
        }
      }
    }

    // Total records count: region's records + all child regions' records
    const totalRecords =
      region._count.records +
      region.childRegions.reduce((sum, c) => sum + c._count.records, 0);

    const languages = Array.from(langMap.values());
    const calculation = calculateVitalityScore({
      languages,
      recordCount: totalRecords,
    });

    const updated = await this.prisma.region.update({
      where: { id: regionId },
      data: {
        vitalityScore: calculation.score,
        vitalityStatus: calculation.status,
      },
    });

    serverCache.invalidatePrefix('regions:');
    serverCache.invalidatePrefix('analytics:');

    // If this is a district, also cascade recalculation to its parent state
    if (region.parentRegionId) {
      const parent = await this.prisma.region.findUnique({
        where: { id: region.parentRegionId },
        include: {
          languages: { include: { language: true } },
          childRegions: {
            select: {
              vitalityScore: true,
              vitalityStatus: true,
            },
          },
          _count: { select: { records: true } },
        },
      });

      if (parent) {
        // Derive parent state vitality from actual child districts (worst-case urgency)
        const childScores = parent.childRegions.map((c) => c.vitalityScore);
        let parentScore: number;
        let parentStatus: VitalityStatus;

        if (childScores.length > 0) {
          parentScore = Math.round(Math.max(...childScores) * 10) / 10;
          parentStatus = scoreToStatus(parentScore);
        } else {
          const parentLangMap = new Map<string, LanguageVitalityData>();
          for (const pl of parent.languages) {
            if (pl.language) parentLangMap.set(pl.language.id, pl.language);
          }
          const parentCalc = calculateVitalityScore({
            languages: Array.from(parentLangMap.values()),
            recordCount: parent._count.records,
          });
          parentScore = parentCalc.score;
          parentStatus = parentCalc.status;
        }

        await this.prisma.region.update({
          where: { id: parent.id },
          data: {
            vitalityScore: parentScore,
            vitalityStatus: parentStatus,
          },
        });
      }
    }

    return {
      region: updated,
      calculation,
    };
  }

  // 7. Recalculate vitality scores across all regions in the database
  async recalculateAllRegions() {
    // A. Recalculate all districts
    const districts = await this.prisma.region.findMany({
      where: { level: 'DISTRICT' },
      select: { id: true },
    });
    for (const d of districts) {
      await this.recalculateRegionVitality(d.id);
    }

    // B. Recalculate all states
    const states = await this.prisma.region.findMany({
      where: { level: 'STATE' },
      select: { id: true },
    });
    for (const s of states) {
      await this.recalculateRegionVitality(s.id);
    }

    serverCache.invalidatePrefix('regions:');
    serverCache.invalidatePrefix('analytics:');
    return { updatedDistricts: districts.length, updatedStates: states.length };
  }

  // 8. Update language details and cascade recalculate all linked regions
  async updateLanguage(
    id: string,
    dto: {
      estimatedSpeakers?: number;
      averageSpeakerAge?: number;
      vitalityStatus?: VitalityStatus;
      name?: string;
    },
  ) {
    const updated = await this.prisma.language.update({
      where: { id },
      data: dto,
    });

    const linkedRegions = await this.prisma.regionLanguage.findMany({
      where: { languageId: id },
      select: { regionId: true },
    });

    for (const lr of linkedRegions) {
      await this.recalculateRegionVitality(lr.regionId);
    }

    serverCache.invalidatePrefix('languages:');
    serverCache.invalidatePrefix('regions:');
    serverCache.invalidatePrefix('analytics:');

    return updated;
  }
}


