require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Untranslatable Entries...');

  // Find records to associate
  const records = await prisma.record.findMany({
    include: {
      language: true,
      region: true,
    },
  });

  if (records.length === 0) {
    console.log('No records found to attach untranslatable entries.');
    return;
  }

  // Clear existing entries
  await prisma.untranslatableEntry.deleteMany();

  // Find Toda, Nihali, Great Andamanese, Spiti, Kutch records
  const todaRecord = records.find((r) => r.language?.name.includes('Toda')) || records[0];
  const nihaliRecord = records.find((r) => r.language?.name.includes('Nihali')) || records[1] || records[0];
  const spitiRecord = records.find((r) => r.language?.name.includes('Spiti')) || records[2] || records[0];
  const andamanRecord = records.find((r) => r.language?.name.includes('Andaman')) || records[3] || records[0];
  const kutchRecord = records.find((r) => r.region?.name.includes('Kutch')) || records[4] || records[0];
  const totoRecord = records.find((r) => r.language?.name.includes('Toto')) || records[5] || records[0];

  const entries = [
    {
      recordId: todaRecord.id,
      term: 'Poh',
      script: 'பொஹ்',
      phonetic: '[pɔːh]',
      literalMeaning: 'Dairy temple sanctum / cosmic churn sanctuary',
      explanation: 'In the Nilgiri Toda world-system, "Poh" is far more than a dairy. It is an ontological shrine where milk is churned in sacred isolation by ordained priests to maintain the universe\'s balance. No non-ordained person may step inside.',
      isFeatured: true,
    },
    {
      recordId: nihaliRecord.id,
      term: 'Jikcho',
      script: 'जिक्छो',
      phonetic: '[d͡ʒik-t͡ʃʰoː]',
      literalMeaning: 'The sudden stillness of the forest canopy before predator arrival',
      explanation: 'From the language isolate Nihali in Buldhana, Maharashtra. Describes the collective, breathless quiet when monkeys and songbirds cease all calling, signaling that an apex predator has entered the watering hollow.',
      isFeatured: false,
    },
    {
      recordId: spitiRecord.id,
      term: 'Chos-skor',
      script: 'ཆོས་སྐོར།',
      phonetic: '[t͡ʃʰøːs-kɔːr]',
      literalMeaning: 'Carrying sacred manuscripts across the perimeter of barley terraces',
      explanation: 'A ritual circumambulation in high-altitude Spiti where village women walk the field borders carrying 400-year-old scriptures on their backs to protect emerging green crops from late Himalayan frost and unseasonal hail.',
      isFeatured: false,
    },
    {
      recordId: andamanRecord.id,
      term: 'Ot-jumu',
      script: null,
      phonetic: '[ɔt-d͡ʒuːmu]',
      literalMeaning: 'Dreamer who communes with sea spirits while submerged in sleep',
      explanation: 'In the Great Andamanese oral universe, an "Ot-jumu" is an elder medicine holder whose medicinal diagnostic songs are given exclusively during deep oceanic dreams, bridging ancestral tides with healing rituals.',
      isFeatured: false,
    },
    {
      recordId: kutchRecord.id,
      term: 'Rogan Pehchaan',
      script: 'રોગન ઓળખ',
      phonetic: '[roː-ɡən pɛh-t͡ʃʰaːn]',
      literalMeaning: 'Intuitive knowledge of castor oil thread viscosity over flame',
      explanation: 'The unspoken sensory mastery of a master artisan who can tell by sound and smell whether castor oil boiled for 48 hours has attained the exact molecular elasticity needed to pull thread on an iron stylus without tearing.',
      isFeatured: false,
    },
    {
      recordId: totoRecord.id,
      term: 'Daisang',
      script: null,
      phonetic: '[dai-saŋ]',
      literalMeaning: 'The ritual hearth debt owed to bamboo roots',
      explanation: 'In the critically endangered Toto dialect spoken by fewer than 1,400 people in Totopara, Daisang acknowledges that humans take life from the mountain grove and must plant shoots in the exact moon phase to return vitality to the soil.',
      isFeatured: false,
    },
  ];

  for (const item of entries) {
    await prisma.untranslatableEntry.create({
      data: item,
    });
  }

  console.log(`Seeded ${entries.length} untranslatable entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
