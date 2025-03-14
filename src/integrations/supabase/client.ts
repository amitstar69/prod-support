
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
    console.log(`Checking if profile exists for user ID: ${userId}`);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error checking profile existence:', profileError);
      return { exists: false, error: profileError.message };
    }
    
    console.log('Profile data found:', profileData);
    
    // Check if user type specific profile exists
    if (profileData?.user_type) {
      const { data: typeProfileData, error: typeProfileError } = profileData.user_type === 'developer' 
        ? await supabase.from('developer_profiles').select('*').eq('id', userId).single()
        : await supabase.from('client_profiles').select('*').eq('id', userId).single();
        
      console.log(`${profileData.user_type}_profiles check results:`, {
        typeProfile: typeProfileData ? 'exists' : 'missing',
        typeProfileError: typeProfileError
      });
      
      return { 
        exists: !!profileData, 
        profileData,
        typeProfileExists: !!typeProfileData,
        typeProfileData,
        typeProfileError
      };
    }
    
    return { exists: !!profileData, profileData };
  } catch (error) {
    console.error('Exception checking profile:', error);
    return { exists: false, error: error.message };
  }
};

// Function to test profile insertion
export const debugCreateProfile = async (userId: string, userType: 'developer' | 'client', email: string, name: string) => {
  try {
    console.log(`Attempting to create test profile for user ID: ${userId}, type: ${userType}`);
    
    // Create base profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        user_type: userType,
        name: name,
        email: email,
        username: email.split('@')[0].toLowerCase(),
      }])
      .select();
      
    if (profileError) {
      console.error('Error creating test profile:', profileError);
      return { success: false, error: profileError.message };
    }
    
    console.log('Test profile created successfully:', profileData);
    
    // Create type-specific profile
    if (userType === 'developer') {
      const { data: devData, error: devError } = await supabase
        .from('developer_profiles')
        .insert([{ id: userId }])
        .select();
        
      if (devError) {
        console.error('Error creating test developer profile:', devError);
        return { success: true, profileData, error: devError.message };
      }
      
      console.log('Test developer profile created successfully:', devData);
      return { success: true, profileData, devData };
    } else {
      const { data: clientData, error: clientError } = await supabase
        .from('client_profiles')
        .insert([{ id: userId }])
        .select();
        
      if (clientError) {
        console.error('Error creating test client profile:', clientError);
        return { success: true, profileData, error: clientError.message };
      }
      
      console.log('Test client profile created successfully:', clientData);
      return { success: true, profileData, clientData };
    }
  } catch (error) {
    console.error('Exception creating test profile:', error);
    return { success: false, error: error.message };
  }
};
