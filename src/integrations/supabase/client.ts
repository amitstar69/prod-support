
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use consistent variables across the application
export const SUPABASE_URL = "https://xptoyeinviaeevdtyjax.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG95ZWludmlhZWV2ZHR5amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NjE4MDEsImV4cCI6MjA1NjUzNzgwMX0.nHEt2UkbPHwYQmvKZhdqgN2ZamxoD4vwHqhHl1AER1I";

// Create and export the supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Log Supabase client initialization
console.log('Supabase client initialized with URL:', SUPABASE_URL);
console.log('Initializing with key starting with:', SUPABASE_ANON_KEY.substring(0, 10) + '...');

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error checking Supabase session:', error);
  } else {
    console.log('Supabase session check successful:', data.session ? 'Active session' : 'No active session');
  }
});
