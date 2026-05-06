import { createBrowserClient } from '@supabase/ssr';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

// Custom storage adapter to handle JSON parsing correctly and recover from corrupted data
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;
      
      // If it's already an object (shouldn't happen but just in case)
      if (typeof item === 'object') return JSON.stringify(item);
      
      // Validate that it's valid JSON before returning
      try {
        JSON.parse(item);
        return item;
      } catch (parseError) {
        // Corrupted data detected - clear it
        console.warn('⚠️ Corrupted session data detected, clearing...', key);
        window.localStorage.removeItem(key);
        return null;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      // Ensure value is a string
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      // Validate it's valid JSON before storing
      try {
        JSON.parse(stringValue);
        window.localStorage.setItem(key, stringValue);
      } catch (parseError) {
        console.error('⚠️ Attempted to store invalid JSON, skipping:', parseError);
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// Clear any corrupted Supabase session data on initialization
function clearCorruptedSessionData() {
  if (typeof window === 'undefined') return;
  
  try {
    // Check all localStorage keys for Supabase auth data
    const keys = Object.keys(window.localStorage);
    const supabaseKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('sb-') ||
      key.includes('auth-token')
    );
    
    for (const key of supabaseKeys) {
      const value = window.localStorage.getItem(key);
      if (!value) continue;
      
      // Try to parse - if it fails, it's corrupted
      try {
        const parsed = JSON.parse(value);
        
        // Check if session data has the string corruption issue
        if (parsed && typeof parsed === 'string' && parsed.includes('access_token')) {
          console.warn('⚠️ Found corrupted session data, clearing:', key);
          window.localStorage.removeItem(key);
        }
      } catch (e) {
        // Invalid JSON - clear it
        console.warn('⚠️ Found invalid JSON in localStorage, clearing:', key);
        window.localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error checking for corrupted session data:', error);
  }
}

// Create a singleton instance to prevent multiple clients
let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) {
    return client;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured. Please check your .env.local file.');
  }

  // Clear any corrupted session data before creating client
  clearCorruptedSessionData();

  client = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        // Prevent lock contention issues
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: customStorage,
      },
    }
  );

  return client;
}
