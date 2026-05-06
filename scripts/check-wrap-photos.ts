import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWrapPhotos() {
  const wrapId = 'a97b4da6-2e64-4cde-9596-b0fb20715a7f';
  
  console.log('🔍 Checking wrap photos for:', wrapId);
  console.log('');
  
  // 1. Get wrap data
  const { data: wrap, error: wrapError } = await supabase
    .from('wraps')
    .select('*')
    .eq('id', wrapId)
    .single();
  
  if (wrapError) {
    console.error('❌ Error fetching wrap:', wrapError);
    return;
  }
  
  console.log('✅ Wrap found:');
  console.log('  Guest Name:', wrap.guest_name);
  console.log('  Event ID:', wrap.event_id);
  console.log('');
  
  // 2. Check wrap.data for photos
  console.log('📊 Wrap Data Structure:');
  console.log('  data.guest.photos:', wrap.data?.guest?.photos || 'NULL');
  console.log('  data.photos.all_photos:', wrap.data?.photos?.all_photos || 'NULL');
  console.log('  data.photos.total_photos:', wrap.data?.photos?.total_photos || 0);
  console.log('');
  
  // 3. Get reviews for this wrap
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, guest_name, photo_urls')
    .eq('event_id', wrap.event_id)
    .eq('guest_name', wrap.guest_name);
  
  if (reviewsError) {
    console.error('❌ Error fetching reviews:', reviewsError);
    return;
  }
  
  console.log('📝 Reviews for this guest:');
  reviews?.forEach((review, index) => {
    console.log(`  Review ${index + 1}:`);
    console.log('    ID:', review.id);
    console.log('    Guest:', review.guest_name);
    console.log('    Photos:', review.photo_urls || 'NULL');
    console.log('    Photo Count:', Array.isArray(review.photo_urls) ? review.photo_urls.length : 0);
  });
  console.log('');
  
  // 4. Check if photos exist in reviews but not in wrap
  const reviewPhotos = reviews?.[0]?.photo_urls || [];
  const wrapPhotos = wrap.data?.guest?.photos || [];
  
  if (reviewPhotos.length > 0 && wrapPhotos.length === 0) {
    console.log('⚠️  ISSUE FOUND:');
    console.log('   Reviews have photos but wrap.data.guest.photos is empty!');
    console.log('   Review photos:', reviewPhotos);
    console.log('   Wrap photos:', wrapPhotos);
    console.log('');
    console.log('💡 Solution: Need to regenerate wrap or update wrap.data.guest.photos');
  } else if (reviewPhotos.length > 0 && wrapPhotos.length > 0) {
    console.log('✅ Photos are correctly stored in wrap!');
  } else {
    console.log('ℹ️  No photos found in either reviews or wrap');
  }
}

checkWrapPhotos().catch(console.error);
