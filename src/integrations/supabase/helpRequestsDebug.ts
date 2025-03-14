
import { supabase } from './client';
import { isValidUUID } from './helpRequestsUtils';

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

// Function to create test help request
export const createTestHelpRequest = async (clientId: string) => {
  try {
    // First validate if this is a UUID format for Supabase or a local ID
    const isUUID = isValidUUID(clientId);
    const isLocal = clientId.startsWith('client-');
    
    if (!isUUID && !isLocal) {
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
    if (isLocal) {
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

// Function to debug insertion and get detailed feedback
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
