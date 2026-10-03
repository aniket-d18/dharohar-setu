const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- PURGING REMAINING TEST SUBMISSIONS AND DUPLICATES ---');

  const testIds = [
    'e018f3fb-61d1-42c3-becc-9ec278d7dd35', // "Music — Ssudtrdc donekjb" (speaker: "ghgj")
    '40426798-4d4d-4271-ac71-44ac2ea4806a', // "national anthem"
    '1d9a4089-7ed4-4ef9-a5d4-d6ccd9a8395c', // "Saying — this is the common saying used in nashik"
    'eced59bb-75ef-4575-a604-12f719f1e859', // "This is the temple which is seems as the starting of the world"
    'cd7a293e-b6bc-491e-b097-400e826e83cd', // duplicate "Maharashtra State song — Its the maharashtra cultural song"
    '480d5ae1-f7f6-43f7-980e-d706589a7615', // duplicate "Oral Folktale of the Sacred River Spirit"
    '5c4d01e2-d044-430e-a7c7-3b9c3ecfcb53', // duplicate "Oral Folktale of the Sacred River Spirit"
    'ae801335-533f-446e-9562-f07da848b66f', // duplicate "A traditional cradle lullaby"
  ];

  console.log(`Deleting ${testIds.length} test submissions/duplicates...`);
  await prisma.untranslatableEntry.deleteMany({ where: { recordId: { in: testIds } } });
  await prisma.consentRecord.deleteMany({ where: { recordId: { in: testIds } } });
  await prisma.verificationLog.deleteMany({ where: { recordId: { in: testIds } } });
  await prisma.recordUpvote.deleteMany({ where: { recordId: { in: testIds } } });
  await prisma.recordTranslation.deleteMany({ where: { recordId: { in: testIds } } });
  
  const res = await prisma.record.deleteMany({
    where: { id: { in: testIds } },
  });

  console.log(`Successfully deleted ${res.count} test records from Supabase.`);

  const remaining = await prisma.record.count();
  console.log(`Total authentic records remaining in Supabase DB: ${remaining}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
