import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { serverCache } from '../../common/cache.service';

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
}

