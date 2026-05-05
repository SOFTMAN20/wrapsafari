'use client';

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '../lib/supabase/client';
import { Profile, Operator } from '../lib/types';
import { authApi } from '../lib/api';

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  operator: Operator | null;
  loading: boolean;
  isAdmin: boolean;
  isOperator: boolean;
  isGuest: boolean;
  signIn: typeof authApi.signIn;
  signUp: typeof authApi.signUp;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Role-based access flags
  const isAdmin = profile?.role === 'admin';
  const isOperator = profile?.role === 'operator';
  const isGuest = !profile || profile?.role === 'guest';

  async function loadProfile(userId: string) {
    try {
      // Load profile and operator data in parallel for faster loading
      const [profileResult, operatorResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, role, created_at, updated_at')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('operators')
          .select('id, business_name, logo_url, brand_color_1, brand_color_2')
          .eq('id', userId)
          .maybeSingle()
      ]);
      
      setProfile(profileResult.data ?? null);
      
      // Only set operator if profile is operator or admin
      if (profileResult.data?.role === 'operator' || profileResult.data?.role === 'admin') {
        setOperator(operatorResult.data ?? null);
      } else {
        setOperator(null);
      }
    } catch (error) {
      // Silent error - only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading profile:', error);
      }
    }
  }

  useEffect(() => {
    let mounted = true;
    
    // Initial session check - optimized for speed
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Load profile asynchronously without blocking
        loadProfile(session.user.id);
      }
      
      // Set loading to false immediately to show UI faster
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Only reload profile if user changed
          if (session.user.id !== user?.id) {
            await loadProfile(session.user.id);
          }
        } else {
          setProfile(null);
          setOperator(null);
          // Don't redirect here - let the component handle it
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const signOut = async () => {
    console.log('🔐 AuthContext: Starting signOut...');
    
    // Clear local state first (synchronous)
    console.log('🧹 Clearing local state...');
    setUser(null);
    setSession(null);
    setProfile(null);
    setOperator(null);
    
    // Clear any cached data in localStorage (synchronous)
    if (typeof window !== 'undefined') {
      console.log('🗑️ Clearing localStorage and sessionStorage...');
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.error('Error clearing storage:', e);
      }
    }
    
    // Sign out from Supabase in background (don't block)
    console.log('☁️ Signing out from Supabase (background)...');
    supabase.auth.signOut().then(() => {
      console.log('✅ Supabase signOut complete');
    }).catch((error: Error) => {
      console.error('❌ Supabase signOut error:', error);
    });
    
    console.log('✅ AuthContext: Local signOut complete');
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, operator, loading,
      isAdmin, isOperator, isGuest,
      signIn: authApi.signIn,
      signUp: authApi.signUp,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
