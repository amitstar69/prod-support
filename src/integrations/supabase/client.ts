
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
    // Add request retry logic
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        // Add timeout to prevent hanging requests
        signal: options?.signal || AbortSignal.timeout(15000),
      }).catch(error => {
        console.error('Supabase fetch error:', error);
        toast.error('Network error. Please check your connection.');
        throw error;
      });
    }
  }
});

// Enhanced logging for Supabase initialization and operations
console.log('Supabase client initialized with URL:', SUPABASE_URL);
console.log('Initializing with key starting with:', SUPABASE_ANON_KEY.substring(0, 10) + '...');

// Test the connection and log more details
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error checking Supabase session:', error);
    toast.error('Unable to connect to the database. Please try again later.');
  } else {
    console.log('Supabase session check successful:', data.session ? 'Active session' : 'No active session');
    
    // If we have a session, log the user ID to verify it's valid
    if (data.session) {
      console.log('Authenticated user ID:', data.session.user.id);
      console.log('Session expires at:', new Date(data.session.expires_at! * 1000).toISOString());
    }
  }
}).catch(err => {
  console.error('Fatal error checking session:', err);
  toast.error('Critical connection error. Please reload the application.');
});

// Add listener for connection issues
window.addEventListener('online', () => {
  console.log('Network connection restored, refreshing Supabase connection');
  supabase.auth.refreshSession();
});

// Export everything from the other modules
export * from './realtime';
export * from './profiles';
export * from './helpRequests';
export * from './testing';
