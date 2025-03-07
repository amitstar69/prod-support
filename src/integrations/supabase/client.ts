
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

// Debug function to inspect help_requests table - Fixed TypeScript error
export const debugInspectHelpRequests = async () => {
  try {
    console.log('Inspecting help_requests table structure and content');
    
    // Use a type any for the response to avoid TypeScript errors
    const { data: tableInfo, error: tableInfoError } = await supabase
      .rpc('get_table_info' as any, { table_name: 'help_requests' });
      
    if (tableInfoError) {
      console.error('Error getting help_requests table info:', tableInfoError);
    } else {
      console.log('help_requests table structure:', tableInfo);
    }
    
    // Get a few records
    const { data: records, error: recordsError } = await supabase
      .from('help_requests')
      .select('*')
      .limit(5);
      
    if (recordsError) {
      console.error('Error getting help_requests records:', recordsError);
    } else {
      console.log('help_requests records (max 5):', records);
    }
    
    return { tableInfo, records, tableInfoError, recordsError };
  } catch (error) {
    console.error('Exception inspecting help_requests:', error);
    return { error: error.message };
  }
};

// Function to create a test help request - use this for debugging
export const createTestHelpRequest = async (clientId: string) => {
  try {
    // First validate if this is a UUID format for Supabase or a local ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUUID = uuidRegex.test(clientId);
    const isLocalId = clientId.startsWith('client-');
    
    if (!isValidUUID && !isLocalId) {
      console.error('Invalid ID format for client_id:', clientId);
      return { success: false, error: 'Invalid ID format for client_id' };
    }
    
    console.log('Creating test help request for client ID:', clientId);
    
    const testRequest = {
      title: 'Test Help Request',
      description: 'This is a test help request created for debugging purposes',
      technical_area: ['Backend', 'Database'],
      urgency: 'medium',
      communication_preference: ['Chat', 'Video Call'],
      estimated_duration: 30,
      budget_range: '$50 - $100',
      client_id: clientId,
      status: 'requirements'
    };
    
    // For local storage IDs, we can't use Supabase
    if (isLocalId) {
      // Store in localStorage instead
      const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
      const newRequest = {
        ...testRequest,
        id: `help-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localHelpRequests.push(newRequest);
      localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
      console.log('Test help request stored locally:', newRequest);
      return { success: true, data: newRequest, storageMethod: 'localStorage' };
    }
    
    // For UUID, try to store in Supabase
    const { data, error } = await supabase
      .from('help_requests')
      .insert(testRequest)
      .select();
      
    if (error) {
      console.error('Error creating test help request in Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Test help request created successfully in Supabase:', data);
    return { success: true, data, storageMethod: 'Supabase' };
    
  } catch (error) {
    console.error('Exception creating test help request:', error);
    return { success: false, error: error.message };
  }
};
