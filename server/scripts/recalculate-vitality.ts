import { PrismaClient } from '@prisma/client';
import { calculateVitalityScore, LanguageVitalityData } from '../common/vitality.calculator';

const prisma = new PrismaClient();

async function recalculateRegion(regionId: string) {
  const region = await prisma.region.findUnique({
    where: { id: regionId },
    include: {
      languages: { include: { language: true } },
      childRegions: {
        include: {
          languages: { include: { language: true } },
          _count: { select: { records: true } },
        },
      },
      records: { include: { language: true } },
      _count: { select: { records: true } },
    },
  });

  if (!region) return null;

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

  if (langMap.size === 0 && region.parentRegionId) {
    const parent = await prisma.region.findUnique({
      where: { id: region.parentRegionId },
      include: { languages: { include: { language: true } } },
    });
    if (parent) {
      for (const pl of parent.languages) {
        if (pl.language) langMap.set(pl.language.id, pl.language);
      }
    }
  }

  const totalRecords =
    region._count.records +
    region.childRegions.reduce((sum, c) => sum + c._count.records, 0);

  const languages = Array.from(langMap.values());
  const calculation = calculateVitalityScore({
    languages,
    recordCount: totalRecords,
  });

  await prisma.region.update({
    where: { id: regionId },
    data: {
      vitalityScore: calculation.score,
      vitalityStatus: calculation.status,
    },
  });

  console.log(
    `[Calculated] ${region.level.padEnd(8)} "${region.name.padEnd(26)}" => Score: ${calculation.score.toFixed(1)}/10 (${calculation.status}) | Records: ${totalRecords}, Languages: ${languages.map((l: any) => l.name).join(', ') || 'None (Default)'}`,
  );

  return calculation;
}

async function main() {
  console.log('--- Starting Vitality Score Backfill & Recalculation ---');

  // 1. Recalculate all districts
  const districts = await prisma.region.findMany({
    where: { level: 'DISTRICT' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  console.log(`\nFound ${districts.length} districts to calculate...`);
  for (const d of districts) {
    await recalculateRegion(d.id);
  }

  // 2. Recalculate all states (aggregating child districts)
  const states = await prisma.region.findMany({
    where: { level: 'STATE' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  console.log(`\nFound ${states.length} states to calculate...`);
  for (const s of states) {
    await recalculateRegion(s.id);
  }

  console.log('\n--- Vitality Score Recalculation Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Error during backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
