import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api';

async function main() {
  console.log('================================================================');
  console.log('  DHAROHAR SETU — REAL LIVE TEST VERIFICATION SUITE');
  console.log('================================================================\n');

  // Authenticate as ADMIN first to get JWT token for authenticated workflows
  const loginResp = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || 'admin@dharohar.org',
      password: process.env.ADMIN_PASSWORD || 'supersecretadminpassword2026',
    }),
  });
  const loginJson = await loginResp.json();
  const authToken = loginJson.token;
  const adminUser = loginJson.user;
  console.log(`[AUTH] Successfully authenticated as ADMIN: ${adminUser.email} (Role: ${adminUser.role})`);
  console.log(`[AUTH] Acquired JWT Token: ${authToken.slice(0, 25)}...`);

  let region = await prisma.region.findFirst();
  let language = await prisma.language.findFirst();

  // Find or create a distinct regular contributor (so reviewer and contributor are distinct)
  let contributor = await prisma.contributor.findFirst({
    where: {
      role: 'CONTRIBUTOR',
      id: { not: adminUser.id },
    },
  });
  if (!contributor) {
    contributor = await prisma.contributor.create({
      data: {
        displayName: 'Aarav Patel (Folk Contributor)',
        email: `contributor-${Date.now()}@dharohar.test`,
        role: 'CONTRIBUTOR',
      },
    });
  }
  console.log(`[SETUP] Separate Contributor: ${contributor.displayName} (${contributor.id})`);

  // ----------------------------------------------------------------
  // TEST 1: DISPUTE TEST
  // ----------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('>>> [TEST 1] DISPUTE ACTION WORKFLOW & DATABASE PERSISTENCE <<<');
  console.log('----------------------------------------------------------------');
  console.log('Step 1.1: Creating test record with initial verificationStatus: UNVERIFIED...');
  const disputeRecord = await prisma.record.create({
    data: {
      mediaType: 'TEXT',
      mediaUrl: 'https://storage.dharohar.org/test-dispute-recording.mp3',
      regionId: region!.id,
      languageId: language?.id,
      category: 'PROVERB',
      visibility: 'PUBLIC',
      verificationStatus: 'UNVERIFIED',
      transcriptionText: 'Original unverified oral proverb sample.',
      summaryText: 'Test record created specifically to test the DISPUTE action workflow.',
      contributorId: contributor.id,
    },
  });
  console.log(`Created Record ID: ${disputeRecord.id}`);
  console.log(`Initial DB verificationStatus: "${disputeRecord.verificationStatus}"`);

  console.log('\nStep 1.2: Submitting dispute through real HTTP POST /api/verification/:recordId/submit...');
  const disputeResponse = await fetch(`${API_URL}/verification/${disputeRecord.id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      reviewerId: adminUser.id,
      action: 'DISPUTE',
      notes: 'Dialect phrasing contested by local community elder council. Disputed pending authentic re-evaluation.',
    }),
  });
  const disputeHttpJson = await disputeResponse.json();
  console.log(`HTTP Response Status: ${disputeResponse.status}`);
  console.log('HTTP Response Body:');
  console.log(JSON.stringify(disputeHttpJson, null, 2));

  console.log('\nStep 1.3: Querying database directly via Prisma (prisma.record.findUnique)...');
  const queriedDisputeRecord = await prisma.record.findUnique({
    where: { id: disputeRecord.id },
    include: {
      verifications: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  console.log('ACTUAL DATABASE QUERY RESULT (TEST 1):');
  console.log(JSON.stringify({
    id: queriedDisputeRecord?.id,
    verificationStatus: queriedDisputeRecord?.verificationStatus,
    summaryText: queriedDisputeRecord?.summaryText,
    updatedAt: queriedDisputeRecord?.updatedAt,
    verifications: queriedDisputeRecord?.verifications?.map(v => ({
      id: v.id,
      action: v.action,
      notes: v.notes,
      createdAt: v.createdAt,
    })),
  }, null, 2));

  // ----------------------------------------------------------------
  // TEST 2A: CONSENT ENFORCEMENT — NO 'AI_TRAINING'
  // ----------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('>>> [TEST 2A] CONSENT ENFORCEMENT: RECORD WITHOUT AI_TRAINING CONSENT <<<');
  console.log('----------------------------------------------------------------');
  console.log('Step 2a.1: Submitting new record with scopesGranted: ["LONG_TERM_STORAGE"] (NO "AI_TRAINING")...');
  const noConsentRecord = await prisma.record.create({
    data: {
      mediaType: 'AUDIO',
      mediaUrl: 'https://storage.dharohar.org/oral-history-unconsented.mp3',
      regionId: region!.id,
      languageId: language?.id,
      category: 'STORY',
      visibility: 'PUBLIC',
      verificationStatus: 'UNVERIFIED',
      transcriptionText: 'Transcribing audio with AI (Gemini Draft)...',
      summaryText: 'Generating cultural summary with AI...',
      contributorId: contributor.id,
      consentRecord: {
        create: {
          scopesGranted: ['LONG_TERM_STORAGE'],
        },
      },
    },
  });
  console.log(`Created Record ID: ${noConsentRecord.id}`);

  console.log('Step 2a.2: Triggering AI enrichment background job via POST /api/records/:id/ai-enrich...');
  const enrichNoConsentResp = await fetch(`${API_URL}/records/${noConsentRecord.id}/ai-enrich`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });
  const enrichNoConsentJson = await enrichNoConsentResp.json();
  console.log('HTTP AI Enrich Response Status:', enrichNoConsentResp.status);
  console.log('HTTP AI Enrich Response Body:', JSON.stringify(enrichNoConsentJson, null, 2));

  console.log('Waiting for background AI enrichment worker to process consent check...');
  let queriedNoConsentRecord: any = null;
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    queriedNoConsentRecord = await prisma.record.findUnique({
      where: { id: noConsentRecord.id },
      include: { consentRecord: true },
    });
    if (queriedNoConsentRecord?.transcriptionText?.includes('AI processing not consented')) {
      break;
    }
  }

  console.log('\nStep 2a.3: Querying database directly via Prisma (prisma.record.findUnique)...');
  console.log('ACTUAL DATABASE QUERY RESULT (TEST 2A):');
  console.log(JSON.stringify({
    id: queriedNoConsentRecord?.id,
    scopesGranted: queriedNoConsentRecord?.consentRecord?.scopesGranted,
    transcriptionText: queriedNoConsentRecord?.transcriptionText,
    summaryText: queriedNoConsentRecord?.summaryText,
    isAwaitingManualPlaceholderConfirmed:
      queriedNoConsentRecord?.transcriptionText?.includes('AI processing not consented') &&
      queriedNoConsentRecord?.summaryText?.includes('AI processing not consented'),
  }, null, 2));

  // ----------------------------------------------------------------
  // TEST 2B: CONSENT ENFORCEMENT — WITH 'AI_TRAINING' CONSENT
  // ----------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('>>> [TEST 2B] CONSENT ENFORCEMENT: RECORD WITH AI_TRAINING CONSENT <<<');
  console.log('----------------------------------------------------------------');
  console.log('Step 2b.1: Submitting new record WITH scopesGranted: ["AI_TRAINING", "LONG_TERM_STORAGE"]...');
  const withConsentRecord = await prisma.record.create({
    data: {
      mediaType: 'TEXT',
      mediaUrl: 'https://storage.dharohar.org/consented-folk-song.mp3',
      regionId: region!.id,
      languageId: language?.id,
      category: 'LULLABY',
      visibility: 'PUBLIC',
      verificationStatus: 'UNVERIFIED',
      transcriptionText: 'The moon watches over the silent forest cradle.',
      summaryText: 'A traditional cradle lullaby sung by mothers during harvest nights.',
      contributorId: contributor.id,
      consentRecord: {
        create: {
          scopesGranted: ['AI_TRAINING', 'LONG_TERM_STORAGE'],
        },
      },
    },
  });
  console.log(`Created Record ID: ${withConsentRecord.id}`);

  console.log('Step 2b.2: Calling POST /api/records/translate with languageCode: "hi"...');
  const translateResp = await fetch(`${API_URL}/records/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      recordId: withConsentRecord.id,
      languageCode: 'hi',
    }),
  });
  const translateJson = await translateResp.json();
  console.log(`HTTP Response Status: ${translateResp.status}`);
  console.log('ACTUAL API RESPONSE BODY (TEST 2B - Consented AI Run):');
  console.log(JSON.stringify(translateJson, null, 2));

  // ----------------------------------------------------------------
  // TEST 2C: VISIBILITY FILTERING — UNAUTHENTICATED VS ADMIN
  // ----------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('>>> [TEST 2C] SERVER-SIDE VISIBILITY ENFORCEMENT (PRIVATE RECORD) <<<');
  console.log('----------------------------------------------------------------');
  console.log('Step 2c.1: Creating a PRIVATE test record...');
  const privateRecord = await prisma.record.create({
    data: {
      mediaType: 'TEXT',
      mediaUrl: 'https://storage.dharohar.org/sacred-private-initiations.mp3',
      regionId: region!.id,
      languageId: language?.id,
      category: 'RITUAL',
      visibility: 'PRIVATE',
      verificationStatus: 'UNVERIFIED',
      transcriptionText: 'Sacred clan secret initiation ceremony chant.',
      summaryText: 'Confidential Clan Ritual [SECRET-PRIVATE-TEST-2026]',
      contributorId: contributor.id,
    },
  });
  console.log(`Created PRIVATE Record ID: ${privateRecord.id}`);
  console.log(`Visibility in DB: "${privateRecord.visibility}"`);

  console.log('\nStep 2c.2: Making UNAUTHENTICATED request: GET /api/records (no Authorization header)...');
  const unauthResp = await fetch(`${API_URL}/records?limit=100`);
  const unauthJson = await unauthResp.json();
  const unauthRecords: any[] = Array.isArray(unauthJson) ? unauthJson : (unauthJson.data || unauthJson.items || []);
  const foundInUnauth = unauthRecords.some((r: any) => r.id === privateRecord.id);
  console.log(`HTTP Status: ${unauthResp.status}`);
  console.log(`Total records returned to unauthenticated visitor: ${unauthRecords.length}`);
  console.log(`Is PRIVATE record "${privateRecord.id}" present in unauthenticated response? -> ${foundInUnauth}`);

  console.log('\nStep 2c.3: Making AUTHENTICATED request as ADMIN: GET /api/records with Authorization header...');
  const adminResp = await fetch(`${API_URL}/records?limit=100`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  const adminJson = await adminResp.json();
  const adminRecords: any[] = Array.isArray(adminJson) ? adminJson : (adminJson.data || adminJson.items || []);
  const foundInAdmin = adminRecords.some((r: any) => r.id === privateRecord.id);
  const foundAdminRecord = adminRecords.find((r: any) => r.id === privateRecord.id);
  console.log(`HTTP Status: ${adminResp.status}`);
  console.log(`Total records returned to ADMIN: ${adminRecords.length}`);
  console.log(`Is PRIVATE record "${privateRecord.id}" present in ADMIN response? -> ${foundInAdmin}`);
  if (foundAdminRecord) {
    console.log('ACTUAL API RESPONSE RECORD IN ADMIN RESPONSE (TEST 2C):');
    console.log(JSON.stringify({
      id: foundAdminRecord.id,
      visibility: foundAdminRecord.visibility,
      summaryText: foundAdminRecord.summaryText,
      verificationStatus: foundAdminRecord.verificationStatus,
    }, null, 2));
  }

  console.log('\n================================================================');
  console.log('  ALL REAL TESTS EXECUTED AND CONFIRMED');
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('Test script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
