/**
 * Migration Script: Update QR Code URLs from localhost to production
 * 
 * This script updates all existing QR codes in the database to use the production URL
 * instead of localhost URLs.
 * 
 * Usage:
 *   pnpm tsx scripts/migrate-qr-urls.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PRODUCTION_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://wrapsafari.vercel.app';

// Localhost patterns to replace
const LOCALHOST_PATTERNS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'https://localhost:3000',
];

interface QRCode {
  id: string;
  event_id: string;
  short_code: string;
  code_url: string;
  created_at: string;
}

async function migrateQRCodeUrls() {
  console.log('🚀 Starting QR Code URL Migration...\n');
  console.log(`📍 Production URL: ${PRODUCTION_URL}\n`);

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Fetch all QR codes
    console.log('📥 Fetching QR codes from database...');
    const { data: qrCodes, error: fetchError } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch QR codes: ${fetchError.message}`);
    }

    if (!qrCodes || qrCodes.length === 0) {
      console.log('✅ No QR codes found in database. Nothing to migrate.');
      return;
    }

    console.log(`📊 Found ${qrCodes.length} QR code(s)\n`);

    // Filter QR codes that need updating
    const qrCodesToUpdate = qrCodes.filter((qr: QRCode) => {
      return LOCALHOST_PATTERNS.some(pattern => qr.code_url.includes(pattern));
    });

    if (qrCodesToUpdate.length === 0) {
      console.log('✅ All QR codes already use production URLs. Nothing to migrate.');
      console.log('\n📋 Current QR codes:');
      qrCodes.forEach((qr: QRCode, index: number) => {
        console.log(`   ${index + 1}. ${qr.code_url}`);
      });
      return;
    }

    console.log(`🔄 Found ${qrCodesToUpdate.length} QR code(s) to update:\n`);

    // Update each QR code
    let successCount = 0;
    let errorCount = 0;

    for (const qr of qrCodesToUpdate) {
      const oldUrl = qr.code_url;
      
      // Replace localhost with production URL
      let newUrl = oldUrl;
      for (const pattern of LOCALHOST_PATTERNS) {
        newUrl = newUrl.replace(pattern, PRODUCTION_URL);
      }

      console.log(`📝 Updating QR Code ID: ${qr.id}`);
      console.log(`   Old: ${oldUrl}`);
      console.log(`   New: ${newUrl}`);

      // Update in database
      const { error: updateError } = await supabase
        .from('qr_codes')
        .update({ code_url: newUrl })
        .eq('id', qr.id);

      if (updateError) {
        console.log(`   ❌ Error: ${updateError.message}\n`);
        errorCount++;
      } else {
        console.log(`   ✅ Updated successfully\n`);
        successCount++;
      }
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Migration Summary:');
    console.log(`   Total QR codes: ${qrCodes.length}`);
    console.log(`   Updated: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Already correct: ${qrCodes.length - qrCodesToUpdate.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (successCount > 0) {
      console.log('✅ Migration completed successfully!');
    }

    if (errorCount > 0) {
      console.log('⚠️  Some QR codes failed to update. Please check the errors above.');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateQRCodeUrls()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
