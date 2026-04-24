/**
 * Script to create a test user with email confirmation bypassed
 * Run this to create a test operator account
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  console.log('Creating test operator account...');

  // 1. Create auth user with email confirmed
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'operator@test.com',
    password: 'Test123456!',
    email_confirm: true, // Bypass email confirmation
    user_metadata: {
      name: 'Test Operator',
      business_name: 'Test Safari Company',
    },
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    return;
  }

  console.log('✅ Auth user created:', authData.user.id);

  // 2. Create operator record
  const { data: operatorData, error: operatorError } = await supabase
    .from('operators')
    .insert({
      id: authData.user.id,
      name: 'Test Operator',
      business_name: 'Test Safari Company',
      email: 'operator@test.com',
      brand_color_1: '#1B4D3E',
      brand_color_2: '#F4C542',
      role: 'operator',
    })
    .select()
    .single();

  if (operatorError) {
    console.error('Error creating operator record:', operatorError);
    return;
  }

  console.log('✅ Operator record created:', operatorData);

  // 3. Create free subscription
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert({
      operator_id: authData.user.id,
      plan: 'free',
      status: 'active',
    })
    .select()
    .single();

  if (subscriptionError) {
    console.error('Error creating subscription:', subscriptionError);
    return;
  }

  console.log('✅ Subscription created:', subscriptionData);

  console.log('\n🎉 Test user created successfully!');
  console.log('\nLogin credentials:');
  console.log('Email: operator@test.com');
  console.log('Password: Test123456!');
  console.log('\nYou can now login at: http://localhost:3000/login');
}

createTestUser();
