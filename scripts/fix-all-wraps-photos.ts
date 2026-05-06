import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAllWraps() {
  console.log('🔍 Finding all wraps with missing photos...\n');
  
  const { data: wraps, error: wrapsError } = await supabase
    .from('wraps')
    .select('id, guest_name, event_id, data');
  
  if (wrapsError) {
    console.error('❌ Error:', wrapsError);
    return;
  }
  
  console.log(`✅ Found ${wraps?.length || 0} total wraps\n`);
  
  const wrapsNeedingFix = wraps?.filter(wrap => {
    const hasPhotos = Array.isArray(wrap.data?.guest?.photos) && wrap.data.guest.photos.length > 0;
    return !hasPhotos;
  }) || [];
  
  console.log(`⚠️  ${wrapsNeedingFix.length} wraps need photo fix\n`);
  
  if (wrapsNeedingFix.length === 0) {
    console.log('🎉 All wraps already have photos!');
    return;
  }
  
  let fixed = 0;
  let failed = 0;
  
  for (const wrap of wrapsNeedingFix) {
    console.log(`🔄 Fixing: ${wrap.guest_name}`);
    
    const { data: review } = await supabase
      .from('reviews')
      .select('*')
      .eq('event_id', wrap.event_id)
      .eq('guest_name', wrap.guest_name)
      .maybeSingle();
    
    if (!review || !review.photo_urls || review.photo_urls.length === 0) {
      console.log(`   ℹ️  No photos - skipping\n`);
      continue;
    }
    
    const updatedData = {
      ...wrap.data,
      guest: {
        ...wrap.data?.guest,
        photos: review.photo_urls,
        rating: review.star_rating,
        review_text: review.review_text,
        memorable_moment: review.metadata?.memorable_moment,
      },
      photos: {
        ...wrap.data?.photos,
        all_photos: review.photo_urls,
        total_photos: review.photo_urls.length,
        highlight_photo: review.photo_urls[0],
      },
    };
    
    const { error: updateError } = await supabase
      .from('wraps')
      .update({ data: updatedData })
      .eq('id', wrap.id);
    
    if (updateError) {
      console.log(`   ❌ Failed\n`);
      failed++;
    } else {
      console.log(`   ✅ Fixed (${review.photo_urls.length} photos)\n`);
      fixed++;
    }
  }
  
  console.log(`\n🎉 Done! Fixed: ${fixed}, Failed: ${failed}`);
}

fixAllWraps().catch(console.error);
