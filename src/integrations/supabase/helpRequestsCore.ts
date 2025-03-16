
import { supabase } from './client';
import { HelpRequest } from '../../types/helpRequest';
import { isValidUUID, isLocalId } from './helpRequestsUtils';
import { toast } from 'sonner';

// Core function to create a help request
export const createHelpRequest = async (helpRequest: Omit<HelpRequest, 'id' | 'created_at' | 'updated_at' | 'ticket_number'>) => {
  try {
    const { client_id } = helpRequest;
    
    // Validate client ID
    if (!client_id) {
      return { success: false, error: 'Client ID is required' };
    }
    
    // Determine if we should use local storage or Supabase
    const useLocalStorage = isLocalId(client_id);
    const useSupabase = isValidUUID(client_id);
    
    if (!useLocalStorage && !useSupabase) {
      return { success: false, error: 'Invalid client ID format' };
    }
    
    // For local storage
    if (useLocalStorage) {
      const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
      
      // Generate a ticket number for local storage (simulating the DB sequence)
      const existingNumbers = localHelpRequests.map((req: HelpRequest) => 
        req.ticket_number || 0
      );
      const maxNumber = Math.max(0, ...existingNumbers);
      const newTicketNumber = maxNumber >= 1000 ? maxNumber + 1 : 1000;
      
      const newRequest = {
        ...helpRequest,
        id: `help-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'open',
        ticket_number: newTicketNumber
      };
      
      localHelpRequests.push(newRequest);
      localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
      console.log('Help request stored locally:', newRequest);
      
      return { success: true, data: newRequest, storageMethod: 'localStorage' };
    }
    
    // For Supabase
    const { data, error } = await supabase
      .from('help_requests')
      .insert({
        ...helpRequest,
        status: 'open' // Set default status to 'open'
      })
      .select();
      
    if (error) {
      console.error('Error creating help request in Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Help request created successfully in Supabase:', data);
    return { success: true, data: data[0], storageMethod: 'Supabase' };
    
  } catch (error) {
    console.error('Exception creating help request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Function to fetch help requests for a client
export const getHelpRequestsForClient = async (clientId: string) => {
  try {
    // Get local help requests
    const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
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
    console.error('Exception fetching help requests:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
      const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
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
      const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
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
    console.error('Exception fetching help request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Function to update a help request
export const updateHelpRequest = async (requestId: string, updates: Partial<Omit<HelpRequest, 'ticket_number'>>) => {
  try {
    // For local help request ID
    if (requestId.startsWith('help-')) {
      const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
      const requestIndex = localHelpRequests.findIndex(
        (request: HelpRequest) => request.id === requestId
      );
      
      if (requestIndex === -1) {
        return { success: false, error: 'Help request not found in local storage' };
      }
      
      const updatedRequest = {
        ...localHelpRequests[requestIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      localHelpRequests[requestIndex] = updatedRequest;
      localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
      
      return { success: true, data: updatedRequest, storageMethod: 'localStorage' };
    }
    
    // For Supabase help request ID
    if (isValidUUID(requestId)) {
      const { data, error } = await supabase
        .from('help_requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating help request in Supabase:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data, storageMethod: 'Supabase' };
    }
    
    // Invalid request ID format
    return { success: false, error: 'Invalid help request ID format' };
    
  } catch (error) {
    console.error('Exception updating help request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
