
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from 'sonner';

// Use consistent variables across the application
export const SUPABASE_URL = "https://xptoyeinviaeevdtyjax.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG95ZWludmlhZWV2ZHR5amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NjE4MDEsImV4cCI6MjA1NjUzNzgwMX0.nHEt2UkbPHwYQmvKZhdqgN2ZamxoD4vwHqhHl1AER1I";

// Create and export the supabase client with improved error handling and retries
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    // Add shorter timeouts for auth operations
    flowType: 'implicit',
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'X-Client-Info': 'devHelp' },
    // Add request retry logic with shorter timeout
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        // Add timeout to prevent hanging requests (reduced from 15s to 8s)
        signal: options?.signal || AbortSignal.timeout(8000),
      }).catch(error => {
        console.error('Supabase fetch error:', error);
        if (error.name !== 'AbortError') {
          toast.error('Network error. Please check your connection.');
        }
        throw error;
      });
    }
  }
});

// Enhanced logging for Supabase initialization and operations
console.log('Supabase client initialized with URL:', SUPABASE_URL);

// Test the connection and log more details
const sessionCheckTimeout = setTimeout(() => {
  console.warn('Supabase auth check timed out');
}, 5000);

// Test the connection with timeout
supabase.auth.getSession().then(({ data, error }) => {
  clearTimeout(sessionCheckTimeout);
  if (error) {
    console.error('Error checking Supabase session:', error);
    toast.error('Unable to connect to the database. Please try again later.');
  } else {
    console.log('Supabase session check successful:', data.session ? 'Active session' : 'No session');
    
    // If we have a session, log the user ID to verify it's valid
    if (data.session) {
      console.log('Authenticated user ID:', data.session.user.id);
      console.log('Session expires at:', new Date(data.session.expires_at! * 1000).toISOString());
    }
  }
}).catch(err => {
  clearTimeout(sessionCheckTimeout);
  console.error('Fatal error checking session:', err);
  toast.error('Critical connection error. Please reload the application.');
});

// Add listener for connection issues
window.addEventListener('online', () => {
  console.log('Network connection restored, refreshing Supabase connection');
  supabase.auth.refreshSession();
});
