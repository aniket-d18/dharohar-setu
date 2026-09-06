import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class RegionsLanguagesService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // 1. Hierarchical regions (State -> Districts)
  async getRegionsHierarchy() {
    return this.prisma.region.findMany({
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
  }

  // 2. GeoJSON boundary for a region
  async getRegionGeoJson(id: string) {
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

    // If custom GeoJSON is stored in DB, return it; otherwise return a structured Feature representation
    if (region.geoJsonData) {
      return region.geoJsonData;
    }

    return {
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
  }

  // 3. Fading fastest languages (sorted by yearsToCritical ascending or CRITICAL status)
  async getFadingFastestLanguages(limit: number = 5) {
    return this.prisma.language.findMany({
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
  }

  // 4. Crafts list with vitality scores and regions
  async getCrafts() {
    return this.prisma.craft.findMany({
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
  }

  // 5. All registered native languages in database
  async getAllLanguages() {
    return this.prisma.language.findMany({
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
  }
}
