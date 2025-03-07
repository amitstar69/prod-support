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
    headers: { 'X-Client-Info': 'devHelp' }
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
    
    // If we have a session, log the user ID to verify it's valid
    if (data.session) {
      console.log('Authenticated user ID:', data.session.user.id);
      console.log('Session expires at:', new Date(data.session.expires_at! * 1000).toISOString());
    }
  }
});

// Add real-time subscription to help_requests table
const setupHelpRequestsSubscription = async () => {
  const { data: authData } = await supabase.auth.getSession();
  
  if (authData.session) {
    const userId = authData.session.user.id;
    
    try {
      const channel = supabase
        .channel('help_requests_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'help_requests',
          filter: `client_id=eq.${userId}`
        }, (payload) => {
          console.log('Real-time update received for help_requests:', payload);
        })
        .subscribe((status) => {
          console.log('Help requests subscription status:', status);
        });
      
      console.log('Real-time subscription to help_requests set up for user:', userId);
      return channel;
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      return null;
    }
  }
  return null;
};

// Setup realtime subscription
setupHelpRequestsSubscription();

// Function to directly test if the help_requests table is accessible
export const testHelpRequestsTableAccess = async () => {
  console.log('Testing help_requests table access...');
  
  // First check authentication status
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Authentication error:', sessionError);
    return { success: false, error: sessionError, authenticated: false };
  }
  
  if (!sessionData.session) {
    console.log('No active session found');
    return { success: false, error: 'No active session', authenticated: false };
  }
  
  console.log('Active session found for user:', sessionData.session.user.id);
  
  try {
    // Try to get a count of help_requests
    const { count, error: countError } = await supabase
      .from('help_requests')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error accessing help_requests table:', countError);
      
      // Get more details about the error
      if (countError.code === '42501') {
        return { 
          success: false, 
          error: 'Permission denied. RLS policies may be preventing access.', 
          details: countError,
          authenticated: true 
        };
      }
      
      return { success: false, error: countError, authenticated: true };
    }
    
    console.log('Successfully accessed help_requests table. Count:', count);
    
    // Now try to fetch actual data
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching help_requests data:', error);
      return { success: false, error, authenticated: true, count };
    }
    
    return { 
      success: true, 
      count, 
      sampleData: data && data.length > 0 ? 'Data found' : 'No data found',
      authenticated: true
    };
  } catch (error) {
    console.error('Exception while testing help_requests access:', error);
    return { success: false, error, authenticated: true };
  }
};

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

//Function to create test help request
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
      
      // Try with service key if possible (this is just for testing)
      console.log('Checking session state to verify auth issues...');
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session state:', sessionData.session ? 'Authenticated' : 'Not authenticated');
      
      if (!sessionData.session) {
        return { 
          success: false, 
          error: error.message, 
          authError: 'Not authenticated - you must be logged in to insert data with RLS enabled' 
        };
      }
      
      return { success: false, error: error.message };
    }
    
    console.log('Test help request created successfully in Supabase:', data);
    return { success: true, data, storageMethod: 'Supabase' };
    
  } catch (error) {
    console.error('Exception creating test help request:', error);
    return { success: false, error: error.message };
  }
};

// Export a function to test inserting a help request directly
export const testInsertHelpRequest = async (clientId: string, title: string = 'Test Request') => {
  try {
    // Validate session
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Session when testing insert:', sessionData);
    
    const testRequest = {
      title,
      description: 'This is a direct test request from the client utility',
      technical_area: ['Testing', 'Database'],
      urgency: 'medium',
      communication_preference: ['Chat'],
      estimated_duration: 15,
      budget_range: '$50 - $100',
      client_id: clientId,
      status: 'requirements'
    };
    
    console.log('Attempting direct test insert with request:', testRequest);
    
    const { data, error } = await supabase
      .from('help_requests')
      .insert(testRequest)
      .select();
      
    if (error) {
      console.error('Error in direct test insert:', error);
      return { success: false, error };
    }
    
    console.log('Direct test insert successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Exception in direct test insert:', error);
    return { success: false, error };
  }
};

// Update the enableRealtimeForHelpRequests function to use Supabase's built-in channel functionality
export const enableRealtimeForHelpRequests = async () => {
  try {
    console.log('Setting up real-time channel for help_requests table...');
    
    const channel = supabase
      .channel('help_requests_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'help_requests'
      }, (payload) => {
        console.log('Real-time update received:', payload);
      })
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    if (channel) {
      console.log('Real-time enabled for help_requests table successfully');
      return { success: true, channel };
    } else {
      console.error('Failed to create channel');
      return { success: false, error: 'Failed to create channel' };
    }
  } catch (error) {
    console.error('Exception enabling real-time:', error);
    return { success: false, error };
  }
};

// Special test function to debug the database access with RLS policies
export const testRLSPolicies = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  
  if (!userId) {
    console.log('No authenticated user found. RLS policies require authentication.');
    return { authenticated: false };
  }
  
  try {
    console.log(`Testing RLS policies with user ID: ${userId}`);
    
    // Test SELECT
    const { data: selectData, error: selectError } = await supabase
      .from('help_requests')
      .select('*')
      .limit(5);
      
    // Test INSERT  
    const testInsert = {
      title: 'RLS Test Request',
      description: 'Testing RLS policies',
      technical_area: ['Testing'],
      urgency: 'medium',
      communication_preference: ['Chat'],
      estimated_duration: 10,
      budget_range: '$50 - $100',
      client_id: userId,
      status: 'requirements'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('help_requests')
      .insert(testInsert)
      .select()
      .single();
      
    // If insert was successful, try to update
    let updateData = null;
    let updateError = null;
    let deleteData = null;
    let deleteError = null;
    
    if (insertData) {
      // Test UPDATE
      const { data: uData, error: uError } = await supabase
        .from('help_requests')
        .update({ title: 'Updated RLS Test Request' })
        .eq('id', insertData.id)
        .select()
        .single();
        
      updateData = uData;
      updateError = uError;
      
      // Test DELETE  
      const { data: dData, error: dError } = await supabase
        .from('help_requests')
        .delete()
        .eq('id', insertData.id)
        .select()
        .single();
        
      deleteData = dData;
      deleteError = dError;
    }
    
    // Return comprehensive results
    return {
      authenticated: true,
      userId,
      select: { success: !selectError, data: selectData, error: selectError },
      insert: { success: !insertError, data: insertData, error: insertError },
      update: { success: !updateError, data: updateData, error: updateError },
      delete: { success: !deleteError, data: deleteData, error: deleteError }
    };
    
  } catch (error) {
    console.error('Exception testing RLS policies:', error);
    return { authenticated: true, userId, error };
  }
};

// Function to test insertion and get detailed feedback
export const debugInspectHelpRequests = async () => {
  try {
    console.log('Inspecting help_requests table structure and content');
    
    // Get table info using RPC
    const { data: tableInfo, error: tableInfoError } = await supabase
      .rpc('get_table_info', { table_name: 'help_requests' });
      
    if (tableInfoError) {
      console.error('Error getting help_requests table info:', tableInfoError);
    } else {
      console.log('help_requests table structure:', tableInfo);
    }
    
    // Check session status
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      console.log('Fetching help_requests as authenticated user:', sessionData.session.user.id);
    } else {
      console.log('Fetching help_requests without authentication');
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
