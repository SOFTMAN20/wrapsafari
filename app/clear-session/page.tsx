'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ClearSessionPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'clearing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const clearSession = () => {
    setStatus('clearing');
    setMessage('Clearing session data...');

    try {
      // Clear all Supabase-related localStorage items
      const keys = Object.keys(localStorage);
      const supabaseKeys = keys.filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') ||
        key.includes('auth-token')
      );

      let clearedCount = 0;
      for (const key of supabaseKeys) {
        localStorage.removeItem(key);
        clearedCount++;
      }

      // Also clear session storage
      const sessionKeys = Object.keys(sessionStorage);
      const supabaseSessionKeys = sessionKeys.filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') ||
        key.includes('auth-token')
      );

      for (const key of supabaseSessionKeys) {
        sessionStorage.removeItem(key);
        clearedCount++;
      }

      setStatus('success');
      setMessage(`Successfully cleared ${clearedCount} session item(s). You can now log in again.`);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Error clearing session:', error);
      setStatus('error');
      setMessage('Failed to clear session data. Please try manually clearing your browser cache.');
    }
  };

  // Auto-clear on mount if there's a corrupted session
  useEffect(() => {
    const checkForCorruption = () => {
      try {
        const keys = Object.keys(localStorage);
        const supabaseKeys = keys.filter(key => 
          key.includes('supabase') || 
          key.includes('sb-') ||
          key.includes('auth-token')
        );

        for (const key of supabaseKeys) {
          const value = localStorage.getItem(key);
          if (!value) continue;

          try {
            const parsed = JSON.parse(value);
            // Check if session data has the string corruption issue
            if (parsed && typeof parsed === 'string' && parsed.includes('access_token')) {
              return true; // Corruption detected
            }
          } catch (e) {
            return true; // Invalid JSON
          }
        }
        return false;
      } catch (error) {
        return false;
      }
    };

    if (checkForCorruption()) {
      setMessage('Corrupted session detected. Click the button below to fix it.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFAF5] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : status === 'error' ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            )}
            Clear Session Data
          </CardTitle>
          <CardDescription>
            If you're experiencing login issues or errors, clearing your session data can help.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`p-4 rounded-lg ${
              status === 'success' ? 'bg-green-50 text-green-800' :
              status === 'error' ? 'bg-red-50 text-red-800' :
              'bg-yellow-50 text-yellow-800'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              This will:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Clear all authentication data</li>
              <li>Log you out of the application</li>
              <li>Fix corrupted session errors</li>
              <li>Redirect you to the login page</li>
            </ul>
          </div>

          <Button
            onClick={clearSession}
            disabled={status === 'clearing' || status === 'success'}
            className="w-full"
            variant={status === 'success' ? 'default' : 'destructive'}
          >
            {status === 'clearing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Cleared! Redirecting...
              </>
            ) : (
              'Clear Session Data'
            )}
          </Button>

          {status === 'idle' && (
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
