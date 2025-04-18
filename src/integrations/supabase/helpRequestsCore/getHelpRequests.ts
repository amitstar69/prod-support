import { supabase, handleSupabaseError } from '../client';
import { HelpRequest } from '../../../types/helpRequest';
import { isLocalId, isValidUUID, getLocalHelpRequests } from './utils';

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
    
    // For Supabase client ID, fetch from database with timeout
    if (isValidUUID(clientId)) {
      try {
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
        const combinedResults = [...(data || []), ...filteredLocalHelpRequests];
        
        return { 
          success: true, 
          data: combinedResults, 
          storageMethod: 'combined' 
        };
      } catch (error) {
        console.error('Supabase fetch error:', error);
        // On exception, return local data as fallback
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          data: filteredLocalHelpRequests,
          storageMethod: 'errorFallback'
        };
      }
    }
    
    // Invalid client ID format
    return { success: false, error: 'Invalid client ID format' };
    
  } catch (error) {
    return handleSupabaseError(error, 'Exception fetching help requests');
  }
};

// Function to get all public help requests for listing
export const getAllPublicHelpRequests = async (isAuthenticated = false, userType: string | null = null) => {
  try {
    console.log('[getAllPublicHelpRequests] Fetching tickets with auth status:', isAuthenticated, 'userType:', userType);
    
    // For authenticated users, fetch real data from the database
    if (isAuthenticated) {
      // Check session first
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[getAllPublicHelpRequests] Session error:', sessionError);
        return { 
          success: false, 
          error: 'Error checking authentication: ' + sessionError.message,
          data: [] 
        };
      }
      
      if (!session?.session) {
        console.log('[getAllPublicHelpRequests] No active session, returning empty list');
        return { 
          success: false, 
          error: 'No active session', 
          data: [] 
        };
      }
      
      // Authenticated with valid session
      console.log('[getAllPublicHelpRequests] Authenticated user ID:', session.session.user.id);
      
      // Simplified query with better error handling
      try {
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
        
        // If we got data from the database, use it
        console.log('[getAllPublicHelpRequests] Fetched tickets from database:', data?.length || 0);
        
        if (data && data.length > 0) {
          // Map through tickets to ensure consistent data structure
          const processedTickets = data.map(ticket => ({
            ...ticket,
            status: ticket.status || 'pending',
            technical_area: ticket.technical_area || [],
            created_at: ticket.created_at || new Date().toISOString()
          }));
          
          return {
            success: true,
            data: processedTickets,
            storageMethod: 'database'
          };
        } else {
          // No tickets found in database
          console.log('[getAllPublicHelpRequests] No tickets found in database');
          return {
            success: true,
            data: [],
            storageMethod: 'database'
          };
        }
      } catch (fetchError) {
        // Handle fetch errors, get local data as fallback
        console.error('[getAllPublicHelpRequests] Database fetch error:', fetchError);
        const localHelpRequests = getLocalHelpRequests();
        
        return {
          success: false,
          error: fetchError instanceof Error ? fetchError.message : 'Error connecting to database',
          data: localHelpRequests,
          storageMethod: 'fallbackLocal'
        };
      }
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
    return handleSupabaseError(error, 'Exception fetching all help requests');
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
    return handleSupabaseError(error, 'Exception fetching help request');
  }
};
