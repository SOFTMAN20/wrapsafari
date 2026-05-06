import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function regenerateWrap() {
  const wrapId = 'a97b4da6-2e64-4cde-9596-b0fb20715a7f';
  
  console.log('🔄 Regenerating wrap:', wrapId);
  console.log('');
  
  // 1. Get the wrap
  const { data: wrap, error: wrapError } = await supabase
    .from('wraps')
    .select('*, events(*)')
    .eq('id', wrapId)
    .single();
  
  if (wrapError || !wrap) {
    console.error('❌ Error fetching wrap:', wrapError);
    return;
  }
  
  console.log('✅ Found wrap for:', wrap.guest_name);
  console.log('   Event:', wrap.events?.title);
  console.log('');
  
  // 2. Get the review with photos
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .select('*')
    .eq('event_id', wrap.event_id)
    .eq('guest_name', wrap.guest_name)
    .single();
  
  if (reviewError || !review) {
    console.error('❌ Error fetching review:', reviewError);
    return;
  }
  
  console.log('✅ Found review with', review.photo_urls?.length || 0, 'photos');
  console.log('');
  
  // 3. Update wrap.data to include photos
  const updatedData = {
    ...wrap.data,
    guest: {
      ...wrap.data?.guest,
      photos: review.photo_urls || [],
      rating: review.star_rating,
      review_text: review.review_text,
      memorable_moment: review.metadata?.memorable_moment,
    },
    photos: {
      ...wrap.data?.photos,
      all_photos: review.photo_urls || [],
      total_photos: review.photo_urls?.length || 0,
      highlight_photo: review.photo_urls?.[0] || null,
    },
  };
  
  // 4. Update the wrap
  const { error: updateError } = await supabase
    .from('wraps')
    .update({ data: updatedData })
    .eq('id', wrapId);
  
  if (updateError) {
    console.error('❌ Error updating wrap:', updateError);
    return;
  }
  
  console.log('✅ Wrap regenerated successfully!');
  console.log('');
  console.log('📊 Updated Data:');
  console.log('   Guest Photos:', updatedData.guest.photos);
  console.log('   Total Photos:', updatedData.photos.total_photos);
  console.log('');
  console.log('🎉 Done! Visit: http://localhost:3000/wrap/' + wrapId);
}

regenerateWrap().catch(console.error);
