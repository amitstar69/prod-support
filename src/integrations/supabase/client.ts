
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use consistent variables across the application
export const SUPABASE_URL = "https://xptoyeinviaeevdtyjax.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG95ZWludmlhZWV2ZHR5amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NjE4MDEsImV4cCI6MjA1NjUzNzgwMX0.nHEt2UkbPHwYQmvKZhdqgN2ZamxoD4vwHqhHl1AER1I";

// Create and export the supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Enhanced logging for Supabase initialization and operations
console.log('Supabase client initialized with URL:', SUPABASE_URL);
console.log('Initializing with key starting with:', SUPABASE_ANON_KEY.substring(0, 10) + '...');

// Test the connection and log more details
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error checking Supabase session:', error);
  } else {
    console.log('Supabase session check successful:', data.session ? 'Active session' : 'No active session');
  }
});

// Add debugging functions to check profile creation
export const debugCheckProfileExists = async (userId: string) => {
  if (!userId) return { exists: false, error: 'No user ID provided' };
  
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error checking profile existence:', profileError);
      return { exists: false, error: profileError.message };
    }
    
    const { data: typeProfileData, error: typeProfileError } = profileData?.user_type === 'developer' 
      ? await supabase.from('developer_profiles').select('*').eq('id', userId).single()
      : await supabase.from('client_profiles').select('*').eq('id', userId).single();
      
    console.log('Profile check results:', {
      baseProfile: profileData ? 'exists' : 'missing',
      typeProfile: typeProfileData ? 'exists' : 'missing',
      typeProfileError: typeProfileError
    });
    
    return { 
      exists: !!profileData, 
      profileData,
      typeProfileExists: !!typeProfileData,
      typeProfileData
    };
  } catch (error) {
    console.error('Exception checking profile:', error);
    return { exists: false, error: error.message };
  }
};
