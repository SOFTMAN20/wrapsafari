'use client';

import { useEffect } from 'react';

/**
 * Component that runs on every page load to clean up corrupted session data
 * This ensures users with old corrupted sessions get automatically fixed
 */
export function SessionCleanup() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    try {
      // Check all localStorage keys for Supabase auth data
      const keys = Object.keys(window.localStorage);
      const supabaseKeys = keys.filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') ||
        key.includes('auth-token')
      );

      let clearedCount = 0;

      for (const key of supabaseKeys) {
        const value = window.localStorage.getItem(key);
        if (!value) continue;

        try {
          const parsed = JSON.parse(value);

          // Check if session data has the string corruption issue
          // This happens when session object is double-stringified
          if (parsed && typeof parsed === 'string' && parsed.includes('access_token')) {
            console.warn('🧹 Auto-cleanup: Removing corrupted session data:', key);
            window.localStorage.removeItem(key);
            clearedCount++;
          }
        } catch (e) {
          // Invalid JSON - clear it
          console.warn('🧹 Auto-cleanup: Removing invalid JSON:', key);
          window.localStorage.removeItem(key);
          clearedCount++;
        }
      }

      if (clearedCount > 0) {
        console.log(`✅ Auto-cleanup: Cleared ${clearedCount} corrupted session item(s)`);
        // Reload the page once to reinitialize with clean state
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error('Error in session cleanup:', error);
    }
  }, []); // Run once on mount

  return null; // This component doesn't render anything
}
