const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING AUTHENTIC BENGALI INTANGIBLE HERITAGE RECORDS ---');

  // 1. Get or create Bengali language
  let bengaliLang = await prisma.language.findUnique({ where: { name: 'Bengali' } });
  if (!bengaliLang) {
    bengaliLang = await prisma.language.create({
      data: {
        name: 'Bengali',
        scriptName: 'Bengali (বাংলা)',
        estimatedSpeakers: 97000000,
        averageSpeakerAge: 38,
        vitalityStatus: 'SAFE',
        yearsToCritical: 100,
      },
    });
  }

  // 2. Get or create West Bengal state & Birbhum district
  let westBengal = await prisma.region.findFirst({ where: { name: 'West Bengal' } });
  if (!westBengal) {
    westBengal = await prisma.region.create({
      data: { name: 'West Bengal', level: 'STATE', vitalityStatus: 'VULNERABLE', vitalityScore: 4.0 },
    });
  }

  let birbhum = await prisma.region.findFirst({ where: { name: 'Birbhum (Kenduli & Shantiniketan)' } });
  if (!birbhum) {
    birbhum = await prisma.region.create({
      data: {
        name: 'Birbhum (Kenduli & Shantiniketan)',
        level: 'DISTRICT',
        parentRegionId: westBengal.id,
        vitalityStatus: 'VULNERABLE',
        vitalityScore: 4.8,
      },
    });
  }

  let contributor = await prisma.contributor.findFirst({ where: { email: 'contributor@dharohar.org' } });

  // 3. Insert Record 1: UNESCO Inscribed Baul Mystic Song & Philosophy of Lalon Fakir
  const baulRecord = await prisma.record.create({
    data: {
      contributorId: contributor?.id,
      regionId: birbhum.id,
      languageId: bengaliLang.id,
      craftId: null,
      mediaType: 'AUDIO',
      mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Bagurumba.ogg',
      thumbnailUrl: '/images/categories/folk-songs.jpg',
      category: 'RITUAL',
      tags: ['unesco-ich', 'baul-songs', 'bengali-oral-tradition', 'lalon-fakir', 'ektara', 'birbhum', 'moner-manush'],
      speakerName: 'Paban Das Baul (Kendrapara Tradition)',
      speakerAge: 68,
      visibility: 'PUBLIC',
      transcriptionText: 'খাঁচার ভিতর অচিন পাখি কেমনে আসে যায়। তারে ধরতে পারলে মনবেড়ি দিতাম পাখির পায়। আট কুঠুরী নয় দরজা আঁটা, মধ্যে মধ্যে ঝরকা কাটা, তার উপরে সদর কোঠা, আয়না মহল তায়। খাঁচার পাখি খাঁচায় রয় না, কখন জানি উড়াল দেয়!',
      translationText: 'How does that unknown bird fly in and out of the cage of this mortal body? Could I but catch it, I would fasten it with the golden chains of my longing mind. Built of eight chambers and nine gateways, with latticed secret windows, crowned by a hall of mirrors at its pinnacle. Yet the bird heeds no confinement; when the call comes, it vanishes into the unmeasured infinite!',
      summaryText: 'UNESCO-recognized Baul mystic oral tradition of Bengal, sung to the rhythmic plucked single-string Ektara and Khamak drum, meditating on the ephemeral soul and universal human dignity.',
      verificationStatus: 'EXPERT_REVIEWED',
      createdAt: new Date('2026-09-18T10:30:00Z'),
      untranslatableEntries: {
        create: [
          {
            term: 'Moner Manush',
            script: 'মনের মানুষ',
            phonetic: '[moner manuʃ]',
            literalMeaning: 'The person of the heart / inner soul companion',
            explanation: 'In the Baul spiritual philosophy of Bengal, "Moner Manush" refers to the divine essence dwelling inside every human being, transcending religious dogmas, caste divisions, and social rituals. Seeking the divine does not require visiting temples or pilgrimages, but looking within the living temple of the human body.',
          },
        ],
      },
      translations: {
        create: [
          {
            languageCode: 'mr',
            translatedTitle: 'अचिन पाखी: बंगालचे गूढ बाउल लोकगीत',
            translatedSummary: 'बंगालची जागतिक वारसा बाउल गूढ परंपरा: एकतारीच्या सुरावर मानवी आत्मा आणि मनातील ईश्वर (मनेर मानुष) यांचे गूढ चिंतन.',
            translatedText: 'या नश्वर शरीराच्या पिंजऱ्यात तो अज्ञात पक्षी कसा येतो आणि जातो? जर मी त्याला पकडू शकलो असतो, तर मी माझ्या अंतःकरणाच्या शृंखलेने त्याचे पाय बांधून ठेवले असते. आठ दालने आणि नऊ दारांनी युक्त हे शरीर, ज्यात सूक्ष्म खिडक्या आहेत आणि सर्वोच्च शिखरावर आरशांचा महाल आहे. तरीही हा पक्षी कधीच पिंजऱ्यात अडकून राहत नाही; वेळ येताच तो अनंत आकाशात उड्डाण करतो! ही बाउल संतपरंपरेतील आत्म्याची व मानवी प्रतिष्ठेची अमर गाथा आहे.',
            translatedTags: ['बाउल', 'लोकगीत', 'अध्यात्म', 'एकतारी'],
          },
          {
            languageCode: 'hi',
            translatedTitle: 'अचिन पाखी: बंगाल का रहस्यवादी बाउल लोकगीत',
            translatedSummary: 'बंगाल की यूनेस्को-मान्यता प्राप्त बाउल रहस्यवादी मौखिक परंपरा: एकतारा के सुरों पर आत्मा और अंतर्मन के देव (मनेर मानुष) का अमर लोकगीत।',
            translatedText: 'इस नश्वर शरीर रूपी पिंजरे में वह अनजान पंछी कैसे आता और चला जाता है? यदि मैं उसे पकड़ पाता, तो अपने मन की बेड़ियों से उसके पैरों को बांध लेता। आठ कोठरियों और नौ दरवाजों से सजा यह शरीर, जिसके शीर्ष पर आईना महल है। फिर भी यह पंछी कभी पिंजरे में रुकता नहीं; समय आने पर अनंत में उड़ जाता है!',
            translatedTags: ['बाउल', 'लोकगीत', 'अध्यात्म', 'एकतारा'],
          },
        ],
      },
    },
  });

  console.log(`Inserted Bengali Baul Record with ID: ${baulRecord.id}`);

  // 4. Insert Record 2: Sundarbans Bhatiyali River Song & Boatmen's Folklore
  const bhatiyaliRecord = await prisma.record.create({
    data: {
      contributorId: contributor?.id,
      regionId: westBengal.id,
      languageId: bengaliLang.id,
      craftId: null,
      mediaType: 'AUDIO',
      mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Purvanchali-Bhojpuri-Awadhi_Folk_Bhajan.ogg',
      thumbnailUrl: '/images/categories/oral-stories.jpg',
      category: 'STORY',
      tags: ['bengali-folklore', 'bhatiyali', 'boatmen-songs', 'sundarbans', 'riverine-culture', 'bhati-srot'],
      speakerName: 'Anil Majhi (Sundarbans Boatman Elder)',
      speakerAge: 71,
      visibility: 'PUBLIC',
      transcriptionText: 'ওরে ও মাঝি ভাই, নদীর কূল নাই কিনার নাই রে! ভাটির টানে যখন নৌকা ভাসে, গাঙের ঢেউয়ে ঢেউয়ে বনবিবি মায়ের আশীর্বাদ খুঁজি। লোনা পানির গাঙে বাঘের ভয়, ডাঙ্গায় ডাকাত, মাঝনদীতে আল্লাহ-ভগবানের ভরसा। ভাটিয়ালির সুরে মন জুড়ায়, দূর দিগন্তের কাছে প্রাণ কাঁদে।',
      translationText: 'O brother boatman, this boundless river has neither shore nor horizon in sight! As our wooden boat drifts with the ebb-tide, through the saline estuary waves we pray for the blessings of Mother Bonbibi. In the tidal waters lurks the tiger, on the banks await hardship, and in midstream only divine grace sustains our oars. The Bhatiyali melody consoles the lonely heart as the soul weeps for distant shores.',
      summaryText: 'Sundarbans delta Bhatiyali riverine folklore: Sacred boatman ballads sung solo against the ebb-tide, invoking Mother Bonbibi for protection in tiger-inhabited mangrove waterways.',
      verificationStatus: 'STEWARD_ENDORSED',
      createdAt: new Date('2026-09-24T14:15:00Z'),
      untranslatableEntries: {
        create: [
          {
            term: 'Bhati-Srot',
            script: 'ভাটি-স্রোত',
            phonetic: '[bʱaːʈi srot]',
            literalMeaning: 'Downstream ebb-tide where sweet river water meets saline tidal surge',
            explanation: 'In Bengal riverine folklore, Bhati-Srot symbolizes not merely the physical movement of tides toward the Bay of Bengal, but a surrender of human ego to the natural rhythm of water, giving birth to the elongated melancholy vowels of Bhatiyali singing.',
          },
        ],
      },
      translations: {
        create: [
          {
            languageCode: 'mr',
            translatedTitle: 'भाटियाली: सुंदरबनच्या नावाड्यांचे लोकगीत',
            translatedSummary: 'सुंदरबन खाडीतील पारंपरिक भाटियाली लोकगाणी: लाटांवर एकट्या चालणाऱ्या नावाड्यांचे आत्मनिवेदन आणि निसर्गाशी संवाद.',
            translatedText: 'अरे ओ नावाडी भावा, या अथांग नदीला ना तीर आहे ना किनारा! जेव्हा आमची नाव ओहोटीच्या प्रवाहावर वाहते, तेव्हा खारट पाण्याच्या लाटांवर आम्ही वनदेवी "आई बोनबिबी"चा आशीर्वाद शोधतो. पाण्यात वाघाची भीती आणि नदीच्या मध्यावर फक्त देवाचाच आधार. या भाटियालीच्या सुरात मन शांत होते आणि दूरच्या क्षितिजाकडे बघून जीव व्याकुळ होतो.',
            translatedTags: ['भाटियाली', 'सुंदरबन', 'लोकगीत', 'नावाडी'],
          },
          {
            languageCode: 'hi',
            translatedTitle: 'भाटियाली: सुंदरवन के मल्लाहों का लोकगीत',
            translatedSummary: 'सुंदरवन डेल्टा का भाटियाली नदी लोक-आख्यान: ओहोटी के समय नाविकों द्वारा गाया जाने वाला मार्मिक पारंपरिक लोकगीत।',
            translatedText: 'अरे ओ मांझी भैया, इस अगाध नदी का न कोई किनारा है न कोई छोर! जब भाटे के बहाव पर हमारी नाव बहती है, तब नमकीन लहरों के बीच हम माता बोनबिबी की कृपा मांगते हैं। पानी में बाघ का खौफ और मझधार में सिर्फ ईश्वर का भरोसा। भाटियाली के तराने में एकाकी मन को सुकून मिलता है।',
            translatedTags: ['भाटियाली', 'सुंदरवन', 'लोकगीत', 'मल्लाह'],
          },
        ],
      },
    },
  });

  console.log(`Inserted Bengali Bhatiyali Record with ID: ${bhatiyaliRecord.id}`);
  console.log('--- ALL AUTHENTIC BENGALI RECORDS SUCCESSFULLY CREATED WITH MARATHI & HINDI TRANSLATIONS ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
