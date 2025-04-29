
import { supabase } from '../client';
import { HelpRequest } from '../../../types/helpRequest';
import { isLocalId, isValidUUID, getLocalHelpRequests, handleError } from './utils';
import { toast } from 'sonner';

// Function to fetch help requests for a client
export const getHelpRequestsForClient = async (clientId: string) => {
  try {
    console.log('[getHelpRequestsForClient] Fetching tickets for client:', clientId);
    
    // Skip local storage check and always use Supabase for authenticated users
    if (isValidUUID(clientId)) {
      console.log('[getHelpRequestsForClient] Using Supabase to fetch tickets');
      
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('[getHelpRequestsForClient] Error fetching from Supabase:', error);
        // Return error but don't fall back to localStorage
        return { 
          success: false, 
          error: error.message,
          data: [],
          storageMethod: 'database_error' 
        };
      }
      
      console.log('[getHelpRequestsForClient] Successfully fetched', data?.length, 'tickets from Supabase');
      
      return { 
        success: true, 
        data: data || [], 
        storageMethod: 'database' 
      };
    }
    
    // Only use localStorage for invalid/local IDs (likely during development/testing)
    if (isLocalId(clientId)) {
      console.log('[getHelpRequestsForClient] Using localStorage for local client ID');
      const localHelpRequests = getLocalHelpRequests();
      const filteredLocalHelpRequests = localHelpRequests.filter(
        (request: HelpRequest) => request.client_id === clientId
      );
      
      return { 
        success: true, 
        data: filteredLocalHelpRequests, 
        storageMethod: 'localStorage' 
      };
    }
    
    // Invalid client ID format
    return { success: false, error: 'Invalid client ID format' };
    
  } catch (error) {
    return handleError(error, 'Exception fetching help requests:');
  }
};

// Function to get all public help requests for listing
export const getAllPublicHelpRequests = async (isAuthenticated = false, selectFields = '*') => {
  try {
    console.log('[getAllPublicHelpRequests] Fetching tickets with auth status:', isAuthenticated);
    console.log('[getAllPublicHelpRequests] Selecting fields:', selectFields);
    
    // For authenticated users, fetch real data from the database
    if (isAuthenticated) {
      // Let's explicitly check what session we have
      const { data: session } = await supabase.auth.getSession();
      console.log('[getAllPublicHelpRequests] Current session:', 
        session?.session ? 'Active (user: ' + session.session.user.id + ')' : 'None');
      
      if (!session?.session) {
        console.log('[getAllPublicHelpRequests] No active session, returning empty list');
        return { 
          success: false, 
          error: 'No active session', 
          data: [] 
        };
      }
      
      // Fetch help requests with optimized query
      console.log('[getAllPublicHelpRequests] Fetching tickets from database...');
      const { data, error } = await supabase
        .from('help_requests')
        .select(selectFields)
        .order('created_at', { ascending: false })
        .limit(50); // Add a reasonable limit to avoid fetching too much data
      
      // Debug: Log what statuses are in the database
      if (data && data.length > 0) {
        const statuses = data.map(ticket => ticket.status);
        const uniqueStatuses = [...new Set(statuses)];
        console.log('[getAllPublicHelpRequests] Found ticket statuses:', uniqueStatuses);
      }
        
      if (error) {
        console.error('[getAllPublicHelpRequests] Error fetching from Supabase:', error);
        // Don't fall back to localStorage, return error instead
        return { 
          success: false, 
          error: 'Failed to fetch help requests: ' + error.message,
          data: [] 
        };
      }
      
      // Log fetched tickets for debugging
      console.log('[getAllPublicHelpRequests] Fetched tickets from database:', data?.length);
      
      return {
        success: true,
        data: data || [],
        storageMethod: 'database'
      };
    } 
    // For non-authenticated users, return sample data
    else {
      // Still using sample data for unauthenticated users, this is expected behavior
      const localHelpRequests = getLocalHelpRequests();
      console.log('[getAllPublicHelpRequests] Using sample tickets for unauthenticated user:', localHelpRequests.length);
      
      return {
        success: true,
        data: localHelpRequests,
        storageMethod: 'localStorage'
      };
    }
  } catch (error) {
    console.error('[getAllPublicHelpRequests] Exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      data: [] 
    };
  }
};

// Function to get a specific help request
export const getHelpRequest = async (requestId: string) => {
  try {
    console.log('[getHelpRequest] Fetching ticket by ID:', requestId);
    
    // Skip localStorage check for valid UUIDs to ensure we always get from Supabase
    if (isValidUUID(requestId)) {
      console.log('[getHelpRequest] Using Supabase to fetch ticket details');
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', requestId)
        .maybeSingle();
        
      if (error) {
        console.error('[getHelpRequest] Error fetching from Supabase:', error);
        // Don't fall back to localStorage, return error
        return { success: false, error: error.message };
      }
      
      if (!data) {
        return { success: false, error: 'Help request not found in database' };
      }
      
      console.log('[getHelpRequest] Successfully fetched ticket from Supabase');
      return { success: true, data, storageMethod: 'database' };
    }
    
    // Only use local storage for explicitly local IDs
    if (requestId.startsWith('help-')) {
      console.log('[getHelpRequest] Using localStorage for local request ID');
      const localHelpRequests = getLocalHelpRequests();
      const helpRequest = localHelpRequests.find(
        (request: HelpRequest) => request.id === requestId
      );
      
      if (!helpRequest) {
        return { success: false, error: 'Help request not found in local storage' };
      }
      
      return { success: true, data: helpRequest, storageMethod: 'localStorage' };
    }
    
    // Invalid request ID format
    return { success: false, error: 'Invalid help request ID format' };
    
  } catch (error) {
    return handleError(error, 'Exception fetching help request:');
  }
};
