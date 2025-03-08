
import { supabase } from './client';
import { HelpRequest } from '../../types/helpRequest';
import { isValidUUID, isLocalId } from './helpRequestsUtils';

// Core function to create a help request
export const createHelpRequest = async (helpRequest: Omit<HelpRequest, 'id' | 'created_at' | 'updated_at'>) => {
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
      const newRequest = {
        ...helpRequest,
        id: `help-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localHelpRequests.push(newRequest);
      localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
      console.log('Help request stored locally:', newRequest);
      
      return { success: true, data: newRequest, storageMethod: 'localStorage' };
    }
    
    // For Supabase
    const { data, error } = await supabase
      .from('help_requests')
      .insert(helpRequest)
      .select();
      
    if (error) {
      console.error('Error creating help request in Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Help request created successfully in Supabase:', data);
    return { success: true, data: data[0], storageMethod: 'Supabase' };
    
  } catch (error) {
    console.error('Exception creating help request:', error);
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
  }
};

// Function to get all public help requests for listing
export const getAllPublicHelpRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching public help requests from Supabase:', error);
      return { 
        success: false, 
        error: error.message,
        data: [] 
      };
    }
    
    return { 
      success: true, 
      data: data || [], 
      storageMethod: 'Supabase' 
    };
    
  } catch (error) {
    console.error('Exception fetching public help requests:', error);
    return { success: false, error: error.message, data: [] };
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
    return { success: false, error: error.message };
  }
};

// Function to update a help request
export const updateHelpRequest = async (requestId: string, updates: Partial<HelpRequest>) => {
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
    return { success: false, error: error.message };
  }
};

// Export the testing functions from helpRequestsDebug module
export * from './helpRequestsDebug';
// Export utility functions
export * from './helpRequestsUtils';
