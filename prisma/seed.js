const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing seed data...');
  // Delete records in order of foreign key dependencies
  await prisma.verificationLog.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.untranslatableEntry.deleteMany();
  await prisma.record.deleteMany();
  await prisma.contributor.deleteMany();
  await prisma.regionLanguage.deleteMany();
  await prisma.regionCraft.deleteMany();
  await prisma.craft.deleteMany();
  await prisma.language.deleteMany();
  await prisma.region.deleteMany();

  console.log('0. Seeding Demo Accounts with bcrypt hashed passwords...');
  const demoSalt = bcrypt.genSaltSync(10);
  const demoHash = bcrypt.hashSync('dharohar2026', demoSalt);

  const contributorUser = await prisma.contributor.create({
    data: {
      displayName: 'Aarav Sharma',
      email: 'contributor@dharohar.org',
      passwordHash: demoHash,
      role: 'CONTRIBUTOR',
      points: 120,
      badges: ['Oral Folklore Pioneer', 'Audio Archivist'],
      authMethod: 'EMAIL_OTP',
    },
  });

  const reviewerUser = await prisma.contributor.create({
    data: {
      displayName: 'Dr. Sunita Devi',
      email: 'reviewer@dharohar.org',
      passwordHash: demoHash,
      role: 'REVIEWER',
      points: 350,
      badges: ['Acoustic Verifier', 'Dialect Expert'],
      authMethod: 'EMAIL_OTP',
    },
  });

  const stewardUser = await prisma.contributor.create({
    data: {
      displayName: 'Rajeshwar Singh (Tribal Council)',
      email: 'steward@dharohar.org',
      passwordHash: demoHash,
      role: 'STEWARD',
      points: 800,
      badges: ['Heritage Custodian', 'Sacred Lore Guardian'],
      authMethod: 'EMAIL_OTP',
    },
  });

  // Admin Account configured via environment variables (never hardcoded)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const adminHash = bcrypt.hashSync(adminPassword, 10);
    await prisma.contributor.create({
      data: {
        displayName: 'System Heritage Administrator',
        email: adminEmail,
        passwordHash: adminHash,
        role: 'ADMIN',
        points: 1000,
        badges: ['Platform Supervisor', 'Supreme Overseer'],
        authMethod: 'EMAIL_OTP',
      },
    });
    console.log(`✓ Created Administrator account from environment: ${adminEmail}`);
  } else {
    console.log('ℹ ADMIN_EMAIL and ADMIN_PASSWORD not set in environment during seed.');
  }

  console.log('1. Seeding Regions (State -> District)...');
  // State 1: Tamil Nadu
  const tn = await prisma.region.create({
    data: {
      name: 'Tamil Nadu',
      level: 'STATE',
      vitalityStatus: 'VULNERABLE',
      vitalityScore: 4.5,
    },
  });

  const nilgiris = await prisma.region.create({
    data: {
      name: 'The Nilgiris',
      level: 'DISTRICT',
      parentRegionId: tn.id,
      vitalityStatus: 'CRITICAL',
      vitalityScore: 8.9,
    },
  });

  // State 2: Maharashtra
  const mh = await prisma.region.create({
    data: {
      name: 'Maharashtra',
      level: 'STATE',
      vitalityStatus: 'SAFE',
      vitalityScore: 2.1,
    },
  });

  const buldhana = await prisma.region.create({
    data: {
      name: 'Buldhana',
      level: 'DISTRICT',
      parentRegionId: mh.id,
      vitalityStatus: 'CRITICAL',
      vitalityScore: 9.4,
    },
  });

  // State 3: Andaman and Nicobar Islands
  const andaman = await prisma.region.create({
    data: {
      name: 'Andaman & Nicobar Islands',
      level: 'STATE',
      vitalityStatus: 'CRITICAL',
      vitalityScore: 9.8,
    },
  });

  const southAndaman = await prisma.region.create({
    data: {
      name: 'South Andaman',
      level: 'DISTRICT',
      parentRegionId: andaman.id,
      vitalityStatus: 'CRITICAL',
      vitalityScore: 9.6,
    },
  });

  // State 4: Himachal Pradesh
  const hp = await prisma.region.create({
    data: {
      name: 'Himachal Pradesh',
      level: 'STATE',
      vitalityStatus: 'VULNERABLE',
      vitalityScore: 5.2,
    },
  });

  const spiti = await prisma.region.create({
    data: {
      name: 'Lahaul & Spiti',
      level: 'DISTRICT',
      parentRegionId: hp.id,
      vitalityStatus: 'ENDANGERED',
      vitalityScore: 7.3,
    },
  });

  // State 5: Gujarat
  const guj = await prisma.region.create({
    data: {
      name: 'Gujarat',
      level: 'STATE',
      vitalityStatus: 'SAFE',
      vitalityScore: 2.8,
    },
  });

  const kutch = await prisma.region.create({
    data: {
      name: 'Kutch',
      level: 'DISTRICT',
      parentRegionId: guj.id,
      vitalityStatus: 'VULNERABLE',
      vitalityScore: 5.8,
    },
  });

  // State 6: West Bengal
  const wb = await prisma.region.create({
    data: {
      name: 'West Bengal',
      level: 'STATE',
      vitalityStatus: 'VULNERABLE',
      vitalityScore: 4.0,
    },
  });

  const alipurduar = await prisma.region.create({
    data: {
      name: 'Alipurduar',
      level: 'DISTRICT',
      parentRegionId: wb.id,
      vitalityStatus: 'CRITICAL',
      vitalityScore: 9.1,
    },
  });

  console.log('2. Seeding Endangered Languages...');
  const toda = await prisma.language.create({
    data: {
      name: 'Toda',
      scriptName: 'Tamil / Oral',
      estimatedSpeakers: 800,
      averageSpeakerAge: 62,
      vitalityStatus: 'CRITICAL',
      yearsToCritical: 4,
    },
  });

  const nihali = await prisma.language.create({
    data: {
      name: 'Nihali',
      scriptName: 'Devanagari / Oral (Language Isolate)',
      estimatedSpeakers: 2000,
      averageSpeakerAge: 58,
      vitalityStatus: 'CRITICAL',
      yearsToCritical: 6,
    },
  });

  const greatAndamanese = await prisma.language.create({
    data: {
      name: 'Great Andamanese (Jero)',
      scriptName: 'Oral Tradition',
      estimatedSpeakers: 48,
      averageSpeakerAge: 69,
      vitalityStatus: 'CRITICAL',
      yearsToCritical: 2,
    },
  });

  const toto = await prisma.language.create({
    data: {
      name: 'Toto',
      scriptName: 'Toto Script',
      estimatedSpeakers: 1600,
      averageSpeakerAge: 46,
      vitalityStatus: 'CRITICAL',
      yearsToCritical: 5,
    },
  });

  const spitiBhoti = await prisma.language.create({
    data: {
      name: 'Spiti Bhoti',
      scriptName: 'Tibetan Script (Uchen)',
      estimatedSpeakers: 12000,
      averageSpeakerAge: 53,
      vitalityStatus: 'ENDANGERED',
      yearsToCritical: 10,
    },
  });

  const kachchhi = await prisma.language.create({
    data: {
      name: 'Kachchhi',
      scriptName: 'Gujarati / Khudabadi',
      estimatedSpeakers: 850000,
      averageSpeakerAge: 48,
      vitalityStatus: 'VULNERABLE',
      yearsToCritical: 25,
    },
  });

  console.log('3. Linking Languages to Regions (RegionLanguage)...');
  await prisma.regionLanguage.createMany({
    data: [
      { regionId: nilgiris.id, languageId: toda.id },
      { regionId: buldhana.id, languageId: nihali.id },
      { regionId: southAndaman.id, languageId: greatAndamanese.id },
      { regionId: alipurduar.id, languageId: toto.id },
      { regionId: spiti.id, languageId: spitiBhoti.id },
      { regionId: kutch.id, languageId: kachchhi.id },
    ],
  });

  console.log('4. Seeding Crafts and Linking (RegionCraft)...');
  const roganArt = await prisma.craft.create({
    data: {
      name: 'Rogan Painting',
      description: 'Rare 400-year-old castor oil and natural pigment fabric art preserved by a single family in Nirona village.',
      estimatedPractitioners: 12,
      vitalityStatus: 'CRITICAL',
    },
  });

  const todaEmbroidery = await prisma.craft.create({
    data: {
      name: 'Toda Pukhoor Embroidery',
      description: 'Distinct red and black geometric weave-count embroidery on unbleached coarse cotton shawl (Poothkuli).',
      estimatedPractitioners: 190,
      vitalityStatus: 'ENDANGERED',
    },
  });

  const spitiThangka = await prisma.craft.create({
    data: {
      name: 'Spiti Buddhist Mural & Thangka',
      description: 'Mineral-pigment sacred Buddhist scroll painting and mud-wall tempera techniques of Ki and Tabo monasteries.',
      estimatedPractitioners: 35,
      vitalityStatus: 'ENDANGERED',
    },
  });

  await prisma.regionCraft.createMany({
    data: [
      { regionId: kutch.id, craftId: roganArt.id },
      { regionId: nilgiris.id, craftId: todaEmbroidery.id },
      { regionId: spiti.id, craftId: spitiThangka.id },
    ],
  });

  console.log('5. Seeding Sample Records & ConsentRecords...');
  const sampleRecords = [
    {
      regionId: nilgiris.id,
      languageId: toda.id,
      craftId: null,
      mediaType: 'AUDIO',
      mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
      category: 'RITUAL',
      tags: ['dairy-temple', 'sacred-buffalo', 'oral-hymn'],
      speakerName: 'Pilu Kuttan',
      speakerAge: 74,
      visibility: 'PUBLIC',
      transcriptionText: 'En nodw kars kars koodsh, nodw pinsh poyth. Tevh noed koodt ensh...',
      translationText: 'When dawn touches the high shola ridge, we lead the sacred buffaloes to the sacred dairy temple, praying for the wellbeing of the seven hills.',
      summaryText: 'Ancient Toda morning prayer sung at the dairy temple threshold.',
      verificationStatus: 'COMMUNITY_VERIFIED',
    },
    {
      regionId: nilgiris.id,
      languageId: toda.id,
      craftId: todaEmbroidery.id,
      mediaType: 'VIDEO',
      mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600',
      category: 'CRAFT_TECHNIQUE',
      tags: ['pukhoor', 'embroidery', 'buffalo-horns-pattern'],
      speakerName: 'Sinamma Toda',
      speakerAge: 68,
      visibility: 'PUBLIC',
      transcriptionText: 'Kadhv poyth pugul nool edth, oru koodu mudinch namba katchi velai panvom.',
      translationText: 'Taking the coarse white cotton and red thread without stencil, we count each warp thread to form the buffalo horn motif.',
      summaryText: 'Demonstration of count-thread geometric embroidery technique on Poothkuli shawl.',
      verificationStatus: 'STEWARD_ENDORSED',
    },
    {
      regionId: buldhana.id,
      languageId: nihali.id,
      craftId: null,
      mediaType: 'AUDIO',
      mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600',
      category: 'STORY',
      tags: ['folktale', 'satpura-forest', 'oral-memory'],
      speakerName: 'Gondia Kalbhor',
      speakerAge: 71,
      visibility: 'PUBLIC',
      transcriptionText: 'Mānki āppā kalā bi-jē. Bīro kōlō kōrā-kō jāyēn...',
      translationText: 'Long ago before the river carved the gorge, the elder tree spirit sheltered our hunting ancestors during the seven-day rains.',
      summaryText: 'An ancient oral folktale explaining the sacred bond between the Nihali forest clans and river spirits.',
      verificationStatus: 'COMMUNITY_VERIFIED',
    },
    {
      regionId: buldhana.id,
      languageId: nihali.id,
      craftId: null,
      mediaType: 'TEXT',
      mediaUrl: '',
      thumbnailUrl: null,
      category: 'PROVERB',
      tags: ['proverb', 'wisdom', 'forest-foraging'],
      speakerName: 'Shantabai Nihali',
      speakerAge: 65,
      visibility: 'PUBLIC',
      transcriptionText: 'Bi-te kalā, jāngle jōro.',
      translationText: 'One who respects the silent water knows the full secrets of the forest canopy.',
      summaryText: 'Traditional Nihali proverb concerning patience while tracking wild honeycombs.',
      verificationStatus: 'EXPERT_REVIEWED',
    },
    {
      regionId: southAndaman.id,
      languageId: greatAndamanese.id,
      craftId: null,
      mediaType: 'AUDIO',
      mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      category: 'LULLABY',
      tags: ['lullaby', 'strait-island', 'turtles', 'ocean'],
      speakerName: 'Licho (Elder)',
      speakerAge: 69,
      visibility: 'PUBLIC',
      transcriptionText: 'Ra-tara cho-ko, tura boi-toko. Bi-jicho eroteko bilikho...',
      translationText: 'Sleep little crab, as the tide recedes beneath the mangrove roots. Bilikha the wind spirit watches over the coral cove.',
      summaryText: 'Cradle song sung by one of the last remaining native speakers of Great Andamanese (Jero dialect).',
      verificationStatus: 'EXPERT_REVIEWED',
    },
    {
      regionId: alipurduar.id,
      languageId: toto.id,
      craftId: null,
      mediaType: 'AUDIO',
      mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600',
      category: 'FESTIVAL',
      tags: ['mayu-festival', 'totopara', 'fermented-rice'],
      speakerName: 'Dhaniram Toto',
      speakerAge: 59,
      visibility: 'PUBLIC',
      transcriptionText: 'Mayu ringtoko shawa baring, dangkai pui-eishi...',
      translationText: 'During the sacred Mayu harvest, elders offer the first earthen pot of freshly brewed rice spirit to Ishpa our mountain deity.',
      summaryText: 'Chant performed during the annual Toto harvest festival in Totopara foothills.',
      verificationStatus: 'COMMUNITY_VERIFIED',
    },
    {
      regionId: kutch.id,
      languageId: kachchhi.id,
      craftId: roganArt.id,
      mediaType: 'VIDEO',
      mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600',
      category: 'CRAFT_TECHNIQUE',
      tags: ['rogan', 'tree-of-life', 'castor-oil', 'iron-stylus'],
      speakerName: 'Abdul Gafur Khatri',
      speakerAge: 62,
      visibility: 'PUBLIC',
      transcriptionText: 'Aeriya jo tel be divas ubaliye, pachi rang sathe mathine haath thi tantu banaviye.',
      translationText: 'Castor oil is boiled for two continuous days till it turns into a thick paste, then kneaded with natural stone pigments into threads over the palm.',
      summaryText: 'Step-by-step oral explanation of preparing authentic Rogan paste and using an iron stylus.',
      verificationStatus: 'COMMUNITY_VERIFIED',
    },
    {
      regionId: kutch.id,
      languageId: kachchhi.id,
      craftId: null,
      mediaType: 'TEXT',
      mediaUrl: '',
      thumbnailUrl: null,
      category: 'RECIPE',
      tags: ['kachchhi-cuisine', 'ringna-no-olo', 'bajra-rotla'],
      speakerName: 'Jasumatiben Patel',
      speakerAge: 73,
      visibility: 'PUBLIC',
      transcriptionText: 'Kachchh jo olo karvo hoy to desi baigan ne gober ji aag me bhunjano...',
      translationText: 'To make authentic Kachchhi Olo, the local purple eggplants must be roasted directly inside slow-burning cow-dung cake embers with garlic cloves.',
      summaryText: 'Traditional recipe and technique for winter clay-oven smoked eggplant mash.',
      verificationStatus: 'UNVERIFIED',
    },
    {
      regionId: spiti.id,
      languageId: spitiBhoti.id,
      craftId: spitiThangka.id,
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
      category: 'CRAFT_TECHNIQUE',
      tags: ['thangka', 'tabo-monastery', 'mineral-pigment'],
      speakerName: 'Lama Tenzin Norbu',
      speakerAge: 67,
      visibility: 'PUBLIC',
      transcriptionText: 'Lapis lazuli dang malachite rdo gzhung nas bzo-ba...',
      translationText: 'Natural lapis lazuli and malachite stones are crushed by hand on flat slate for three days with yak-skin glue to achieve eternal colors.',
      summaryText: 'Oral documentation of ancient mineral pigment grinding used in 1000-year-old Spiti monastery frescoes.',
      verificationStatus: 'STEWARD_ENDORSED',
    },
    {
      regionId: spiti.id,
      languageId: spitiBhoti.id,
      craftId: null,
      mediaType: 'AUDIO',
      mediaUrl: 'https://archive.org/download/sample-heritage-audio/spiti_winter_folksong.mp3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
      category: 'LULLABY',
      tags: ['high-altitude', 'snow-season', 'shepherd-song'],
      speakerName: 'Dolma Angmo',
      speakerAge: 56,
      visibility: 'PUBLIC',
      transcriptionText: 'Khang-pa dkar-po gangs-ri zhol-du, bu-chung nyal-la gser-gyi...',
      translationText: 'In our whitewashed home beneath the great snow peaks, sleep my darling wrapped in thick sheep wool until the spring thaw.',
      summaryText: 'Spiti shepherd winter lullaby passed down through seven maternal generations.',
      verificationStatus: 'COMMUNITY_VERIFIED',
    },
    {
      regionId: alipurduar.id,
      languageId: toto.id,
      craftId: null,
      mediaType: 'TEXT',
      mediaUrl: '',
      thumbnailUrl: null,
      category: 'LIFE_SKILL',
      tags: ['indigenous-medicine', 'totopara', 'bamboo-architecture'],
      speakerName: 'Subba Toto',
      speakerAge: 64,
      visibility: 'PUBLIC',
      transcriptionText: 'Totopara pahaad te bambu kaatan samay purnima te kaatle ghoon na lage...',
      translationText: 'Harvesting the wild mountain bamboo only during the dark moon phase ensures the timber will resist borers and damp rot for thirty monsoons.',
      summaryText: 'Indigenous lunar-aligned bamboo harvesting knowledge for earthquake-resistant stilt houses.',
      verificationStatus: 'COMMUNITY_VERIFIED',
    },
  ];

  for (let i = 0; i < sampleRecords.length; i++) {
    const item = sampleRecords[i];
    // Record at index 1 is submitted by the reviewer to test reviewer self-verification blocking
    const assignedContributorId = i === 1 ? reviewerUser.id : i === 4 ? stewardUser.id : contributorUser.id;

    const record = await prisma.record.create({
      data: {
        regionId: item.regionId,
        languageId: item.languageId,
        craftId: item.craftId,
        contributorId: assignedContributorId,
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl,
        category: item.category,
        tags: item.tags,
        speakerName: item.speakerName,
        speakerAge: item.speakerAge,
        visibility: item.visibility,
        transcriptionText: item.transcriptionText,
        translationText: item.translationText,
        summaryText: item.summaryText,
        verificationStatus: item.verificationStatus,
      },
    });

    // Create consent record for each record
    await prisma.consentRecord.create({
      data: {
        recordId: record.id,
        consentVersion: 'v1.0',
        scopesGranted: ['PUBLIC_ARCHIVE', 'AI_TRAINING', 'EXPORT_PRESERVATION'],
        isAnonymous: false,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
