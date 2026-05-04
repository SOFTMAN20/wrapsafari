import { createClient } from '../supabase/client';

const supabase = createClient();

interface SignUpData {
  email: string;
  password: string;
  name: string;
  businessName: string;
  brandColor1?: string;
  brandColor2?: string;
  logoFile?: File | null;
  role?: 'operator' | 'admin';
}

export const authApi = {
  async signUp({
    email,
    password,
    name,
    businessName,
    brandColor1 = '#1B4D3E',
    brandColor2 = '#F4C542',
    logoFile,
    role = 'operator',
  }: SignUpData) {
    console.log('🚀 Starting signup process...', {
      email,
      name,
      businessName,
      brandColor1,
      brandColor2,
      hasLogo: !!logoFile,
    });

    // 1. Create auth user with metadata (operator record will be auto-created by trigger)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          business_name: businessName,
          brand_color_1: brandColor1,
          brand_color_2: brandColor2,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (authError) {
      console.error('❌ Auth signup error:', authError);
      throw authError;
    }
    if (!authData.user) throw new Error('User creation failed');

    console.log('✅ Auth user created:', authData.user.id);

    // Check if email confirmation is required
    if (!authData.session) {
      // Email confirmation required - operator record will be created by trigger
      console.log('📧 Email confirmation required');
      throw new Error('Please check your email to confirm your account before logging in.');
    }

    console.log('✅ Session created, proceeding with operator setup...');

    // Session exists - trigger has already created profile, operator, and subscription
    // Reduced wait time for faster signup (trigger is fast enough)
    await new Promise(resolve => setTimeout(resolve, 300));

    let logoUrl: string | null = null;

    // 2. Upload logo if provided (async, don't wait for completion)
    if (logoFile) {
      console.log('📤 Uploading logo...');
      const ext = logoFile.name.split('.').pop();
      const path = `logos/${authData.user.id}_${Date.now()}.${ext}`;

      // Upload logo in background without blocking signup
      supabase.storage
        .from('safariwrap-assets')
        .upload(path, logoFile)
        .then(({ error: uploadError }) => {
          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('safariwrap-assets')
              .getPublicUrl(path);
            
            logoUrl = urlData.publicUrl;
            console.log('✅ Logo uploaded:', logoUrl);

            // Update operator with logo URL in background
            supabase
              .from('operators')
              .update({ logo_url: logoUrl })
              .eq('id', authData.user.id)
              .then(({ error: logoUpdateError }) => {
                if (logoUpdateError) {
                  console.error('❌ Error updating operator logo:', logoUpdateError);
                } else {
                  console.log('✅ Operator logo updated successfully');
                }
              });
          } else {
            console.error('❌ Logo upload error:', uploadError);
          }
        });
    }

    // Skip operator verification - let the dashboard load it
    // This makes signup instant
    console.log('✅ Signup complete! Redirecting to dashboard...');

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  },

  async getUserRole(): Promise<'operator' | 'admin' | 'guest'> {
    const { data, error } = await supabase.rpc('get_user_role');
    if (error) {
      console.error('Error getting user role:', error);
      return 'guest';
    }
    return data as 'operator' | 'admin' | 'guest';
  },

  async isAdmin(): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    return data as boolean;
  },
};
