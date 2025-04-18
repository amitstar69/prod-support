
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from 'sonner';

// Use consistent variables across the application
export const SUPABASE_URL = "https://xptoyeinviaeevdtyjax.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG95ZWludmlhZWV2ZHR5amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NjE4MDEsImV4cCI6MjA1NjUzNzgwMX0.nHEt2UkbPHwYQmvKZhdqgN2ZamxoD4vwHqhHl1AER1I";

// Performance optimizations - connect once
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

// Track connection attempts
let connectionAttempts = 0;
const maxConnectionAttempts = 3;

// Create and export the supabase client with improved error handling and retries
export const supabase = (() => {
  try {
    console.time('supabase-init');
    
    if (supabaseClient) {
      return supabaseClient;
    }
    
    connectionAttempts++;
    
    if (connectionAttempts > maxConnectionAttempts) {
      console.error(`Maximum Supabase connection attempts (${maxConnectionAttempts}) reached`);
      toast.error('Database connection failed. Please reload the page.');
      throw new Error('Maximum connection attempts reached');
    }
    
    // Create the client
    supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
            // Add timeout to prevent hanging requests - increased from 10s to 20s
            signal: options?.signal || AbortSignal.timeout(20000), // Increased from 10s to 20s
          }).catch(error => {
            console.error('Supabase fetch error:', error);
            toast.error('Network error. Please check your connection.');
            throw error;
          });
        }
      }
    });
    
    console.timeEnd('supabase-init');
    console.log('Supabase client initialized with URL:', SUPABASE_URL);
    
    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    toast.error('Failed to connect to the database. Please reload the application.');
    throw error;
  }
})();

// Run a lightweight test of the connection to ensure it's working
(async function testConnection() {
  try {
    console.time('supabase-connection-test');
    
    // Use a timer to detect slow connections
    const timer = setTimeout(() => {
      console.warn('Supabase connection test taking too long');
    }, 3000); // Increased from 2s to 3s
    
    // Create an abort controller to limit test time
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      console.warn('Supabase connection test aborted due to timeout');
    }, 10000); // Increased from 5s to 10s
    
    // Fix the query to avoid the error in console logs
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .abortSignal(controller.signal)
      .limit(1);
    
    clearTimeout(timer);
    clearTimeout(timeout);
    
    if (error) {
      console.error('Supabase connection test error:', error);
    } else {
      console.log('Supabase connection test successful', data ? `found ${data.length} profiles` : '');
    }
    
    console.timeEnd('supabase-connection-test');
  } catch (error) {
    console.error('Exception in Supabase connection test:', error);
  }
})();

// Add listener for connection issues
window.addEventListener('online', () => {
  console.log('Network connection restored, refreshing Supabase connection');
  supabase.auth.refreshSession();
});
