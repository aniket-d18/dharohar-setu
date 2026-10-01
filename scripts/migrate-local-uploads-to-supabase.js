require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const { join } = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('--- SUPABASE STORAGE MIGRATION ---');

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://rikcqywntoycbrwolffl.supabase.co';

  const supabaseKey =
    (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY.startsWith('sb_publishable_') ? process.env.SUPABASE_ANON_KEY : null) ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'heritage-media';

  if (!supabaseKey) {
    console.error('❌ Error: Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in .env');
    console.log('Please add your key to .env and run this script again.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  console.log(`Connecting to Supabase at: ${supabaseUrl}`);
  console.log(`Target Bucket: ${bucketName}`);

  // Find all records that have local '/uploads/' in mediaUrl
  const localRecords = await prisma.record.findMany({
    where: {
      mediaUrl: {
        contains: '/uploads/',
      },
    },
    select: {
      id: true,
      mediaUrl: true,
      category: true,
      summaryText: true,
    },
  });

  console.log(`Found ${localRecords.length} records with local /uploads/ URLs to migrate.`);

  for (const r of localRecords) {
    const filename = r.mediaUrl.split('/uploads/').pop()?.split('?')[0];
    if (!filename) continue;

    const localPath = join(process.cwd(), 'public', 'uploads', filename);
    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️ Local file not found on disk: ${localPath}, skipping.`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    let folder = 'media';
    let mimeType = 'application/octet-stream';

    if (filename.endsWith('.webm')) mimeType = 'audio/webm';
    else if (filename.endsWith('.mp3')) mimeType = 'audio/mpeg';
    else if (filename.endsWith('.ogg')) mimeType = 'audio/ogg';
    else if (filename.endsWith('.wav')) mimeType = 'audio/wav';
    else if (filename.endsWith('.mp4')) mimeType = 'video/mp4';
    else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (filename.endsWith('.png')) mimeType = 'image/png';

    if (mimeType.startsWith('audio/')) folder = 'audio';
    else if (mimeType.startsWith('image/')) folder = 'images';
    else if (mimeType.startsWith('video/')) folder = 'videos';

    const storagePath = `${folder}/${filename}`;

    console.log(`Uploading ${filename} (${mimeType}) -> ${bucketName}/${storagePath}...`);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error(`❌ Failed to upload ${filename}: ${error.message}`);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // Update in Database
    await prisma.record.update({
      where: { id: r.id },
      data: { mediaUrl: publicUrl },
    });

    console.log(`✓ Record ${r.id} updated with cloud URL: ${publicUrl}`);
  }

  console.log('\n🎉 Migration complete!');
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
