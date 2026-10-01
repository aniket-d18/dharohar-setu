const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const records = await prisma.record.count();
  const regions = await prisma.region.count();
  const languages = await prisma.language.count();
  const crafts = await prisma.craft.count();
  const untranslatable = await prisma.untranslatableEntry.count();
  console.log({ records, regions, languages, crafts, untranslatable });
}

main().catch(console.error).finally(() => prisma.$disconnect());
