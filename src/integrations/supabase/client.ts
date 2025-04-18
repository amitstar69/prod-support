
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Use environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create a custom fetch function with timeout to prevent hanging requests
const fetchWithTimeout = (url: RequestInfo, options: RequestInit = {}, timeout = 10000): Promise<Response> => {
  return new Promise((resolve, reject) => {
    // Create abort controller for timeout
    const controller = new AbortController();
    options.signal = controller.signal;
    
    // Set timeout to abort request
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error('Request timeout'));
    }, timeout);
    
    fetch(url, options)
      .then(resolve)
      .catch((error) => {
        // Log any Supabase fetch errors
        console.error('Supabase fetch error:', error);
        reject(error);
      })
      .finally(() => clearTimeout(timer));
  });
};

// Create the Supabase client with custom fetch
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: fetchWithTimeout as typeof fetch
  }
});

// Error handler helper for consistent error handling
export const handleSupabaseError = (error: any, context: string) => {
  const errorMessage = error?.message || 'Unknown error';
  console.error(`${context}: ${errorMessage}`, error);
  return {
    success: false,
    error: errorMessage
  };
};

// Export a helper function to test database connectivity
export const testDatabaseConnection = async () => {
  try {
    // Simple query to check database connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error testing database connection:', error);
    return false;
  }
};
