
import { supabase } from '../client';
import { HelpRequest } from '../../../types/helpRequest';
import { isLocalId, isValidUUID, getLocalHelpRequests, handleError } from './utils';
import { toast } from 'sonner';

// Function to fetch help requests for a client
export const getHelpRequestsForClient = async (clientId: string) => {
  try {
    // Get local help requests
    const localHelpRequests = getLocalHelpRequests();
    const filteredLocalHelpRequests = localHelpRequests.filter(
      (request: HelpRequest) => request.client_id === clientId
    );
    
    // If it's a local client ID, return only local requests
    if (isLocalId(clientId)) {
      return { 
        success: true, 
        data: filteredLocalHelpRequests, 
        storageMethod: 'localStorage' 
      };
    }
    
    // For Supabase client ID, fetch from database
    if (isValidUUID(clientId)) {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching help requests from Supabase:', error);
        // If there's an error with Supabase, still return local requests
        return { 
          success: false, 
          error: error.message,
          data: filteredLocalHelpRequests, 
          storageMethod: 'fallbackToLocalStorage' 
        };
      }
      
      // Combine Supabase results with any local requests
      const combinedResults = [...data, ...filteredLocalHelpRequests];
      
      return { 
        success: true, 
        data: combinedResults, 
        storageMethod: 'combined' 
      };
    }
    
    // Invalid client ID format
    return { success: false, error: 'Invalid client ID format' };
    
  } catch (error) {
    return handleError(error, 'Exception fetching help requests:');
  }
};

// Function to get all public help requests for listing
export const getAllPublicHelpRequests = async (isAuthenticated = false) => {
  try {
    console.log('[getAllPublicHelpRequests] Fetching tickets with auth status:', isAuthenticated);
    
    // For authenticated users, fetch real data from the database
    if (isAuthenticated) {
      // Let's explicitly check what session we have
      const { data: session } = await supabase.auth.getSession();
      console.log('[getAllPublicHelpRequests] Current session:', session?.session ? 'Active' : 'None');
      
      if (!session?.session) {
        console.log('[getAllPublicHelpRequests] No active session, returning empty list');
        return { 
          success: false, 
          error: 'No active session', 
          data: [] 
        };
      }
      
      // Log the user ID to confirm we have valid authentication
      console.log('[getAllPublicHelpRequests] Authenticated user ID:', session.session.user.id);
      
      // Check if the RLS policy should apply by getting the user type
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.session.user.id)
        .single();
      
      console.log('[getAllPublicHelpRequests] User profile:', profileData, 'Error:', profileError);
      
      if (profileError) {
        console.error('[getAllPublicHelpRequests] Error fetching user profile:', profileError);
        toast.error('Error determining user type. Please try again.');
      }
      
      // Debug query directly to check table access
      const { count, error: countError } = await supabase
        .from('help_requests')
        .select('*', { count: 'exact', head: true });
      
      console.log('[getAllPublicHelpRequests] Table access check - Count:', count, 'Error:', countError);
      
      // Fetch all help requests (now using the RLS policy we added)
      // The policy will automatically filter based on user type
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('[getAllPublicHelpRequests] Error fetching from Supabase:', error);
        return { 
          success: false, 
          error: 'Failed to fetch help requests: ' + error.message,
          data: [] 
        };
      }
      
      // If we got data from the database, use it and log all tickets for debugging
      console.log('[getAllPublicHelpRequests] Fetched tickets from database:', data?.length);
      if (data) {
        data.forEach((ticket, index) => {
          console.log(`[getAllPublicHelpRequests] DB Ticket ${index+1}:`, {
            id: ticket.id,
            status: ticket.status,
            title: ticket.title,
            client_id: ticket.client_id
          });
        });
      }
      
      return {
        success: true,
        data: data || [],
        storageMethod: 'database'
      };
    } 
    // For non-authenticated users, return sample data
    else {
      // Get local storage requests for sample data
      const localHelpRequests = getLocalHelpRequests();
      console.log('[getAllPublicHelpRequests] Local tickets for unauthenticated user:', localHelpRequests.length);
      
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
    // For local help request ID
    if (requestId.startsWith('help-')) {
      const localHelpRequests = getLocalHelpRequests();
      const helpRequest = localHelpRequests.find(
        (request: HelpRequest) => request.id === requestId
      );
      
      if (!helpRequest) {
        return { success: false, error: 'Help request not found in local storage' };
      }
      
      return { success: true, data: helpRequest, storageMethod: 'localStorage' };
    }
    
    // For Supabase help request ID
    if (isValidUUID(requestId)) {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', requestId)
        .single();
        
      if (error) {
        console.error('Error fetching help request from Supabase:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data, storageMethod: 'Supabase' };
    }
    
    // Invalid request ID format
    return { success: false, error: 'Invalid help request ID format' };
    
  } catch (error) {
    return handleError(error, 'Exception fetching help request:');
  }
};
