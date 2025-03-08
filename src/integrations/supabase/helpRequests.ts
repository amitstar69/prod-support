import { supabase } from './client';
import { HelpRequest, HelpRequestMatch } from '../../types/helpRequest';
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
export const getAllPublicHelpRequests = async (isAuthenticated = false) => {
  try {
    console.log('getAllPublicHelpRequests: Fetching all public help requests...');
    
    // Get local storage requests for comparison
    const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
    console.log('Local help requests:', localHelpRequests.length);
    
    // Fetch real data from the database for both authenticated and non-authenticated users
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .eq('status', 'pending') // Only show pending requests that need devs
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching public help requests from Supabase:', error);
      
      // If there's an error and it's specifically a permissions error for non-authenticated users
      // only then fall back to demo data
      if (!isAuthenticated && error.message.includes('permission denied')) {
        console.log('Permission denied error for non-authenticated user, using demo data');
        return {
          success: true,
          data: [], // We'll use the DEMO_TICKETS from DeveloperDashboard.tsx
          storageMethod: 'demoOnly'
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to fetch help requests: ' + error.message,
        data: [] 
      };
    }
    
    // If we have real data from the database, use it
    if (data && data.length > 0) {
      console.log('Found real database data, returning it:', data.length, 'records');
      return {
        success: true,
        data: data,
        storageMethod: 'database'
      };
    }
    
    // If no real data and no authenticated user, include demo data as fallback
    if (!isAuthenticated && data.length === 0) {
      console.log('No real data and not authenticated, returning empty array (will use demo data)');
      return {
        success: true,
        data: [],
        storageMethod: 'demoOnly'
      };
    }
    
    // Otherwise just return whatever we got (which might be an empty array)
    console.log('Returning data as-is:', data.length, 'records');
    return { 
      success: true, 
      data: data,
      storageMethod: data.length > 0 ? 'database' : 'empty'
    };
  } catch (error) {
    console.error('Exception fetching public help requests:', error);
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

// Function to create or update a developer application for a help request
export const submitDeveloperApplication = async (
  requestId: string, 
  developerId: string, 
  applicationData: {
    proposed_message: string;
    proposed_duration: number;
    proposed_rate: number;
  }
) => {
  try {
    if (!requestId || !developerId) {
      return { success: false, error: 'Missing required fields' };
    }

    // Check if this is a local storage ticket (starts with "help-")
    if (requestId.startsWith('help-') || requestId.startsWith('demo-')) {
      // For local storage tickets, we can't use the database
      // Instead, we'll store the application in local storage
      const localApplications = JSON.parse(localStorage.getItem('help_request_matches') || '[]');
      
      // Check if an application already exists
      const existingIndex = localApplications.findIndex(
        (app: any) => app.developer_id === developerId && app.request_id === requestId
      );
      
      if (existingIndex >= 0) {
        // Update existing application
        localApplications[existingIndex] = {
          ...localApplications[existingIndex],
          proposed_message: applicationData.proposed_message,
          proposed_duration: applicationData.proposed_duration,
          proposed_rate: applicationData.proposed_rate,
          match_score: 85,
          status: 'pending',
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem('help_request_matches', JSON.stringify(localApplications));
        return { success: true, data: localApplications[existingIndex], isUpdate: true };
      }
      
      // Create new application
      const newApplication = {
        id: `app-${Date.now()}`,
        request_id: requestId,
        developer_id: developerId,
        status: 'pending',
        match_score: 85,
        proposed_message: applicationData.proposed_message,
        proposed_duration: applicationData.proposed_duration,
        proposed_rate: applicationData.proposed_rate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localApplications.push(newApplication);
      localStorage.setItem('help_request_matches', JSON.stringify(localApplications));
      
      // Update the ticket status to 'matching' if it was 'pending'
      const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
      const ticketIndex = localHelpRequests.findIndex((req: any) => req.id === requestId);
      
      if (ticketIndex >= 0 && localHelpRequests[ticketIndex].status === 'pending') {
        localHelpRequests[ticketIndex].status = 'matching';
        localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
      }
      
      return { success: true, data: newApplication, isUpdate: false };
    }

    // For database tickets, proceed with Supabase operations
    // Check if an application already exists
    const { data: existingMatch, error: checkError } = await supabase
      .from('help_request_matches')
      .select('*')
      .eq('developer_id', developerId)
      .eq('request_id', requestId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing application:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingMatch) {
      // Update existing application
      const { data, error } = await supabase
        .from('help_request_matches')
        .update({
          proposed_message: applicationData.proposed_message,
          proposed_duration: applicationData.proposed_duration,
          proposed_rate: applicationData.proposed_rate,
          match_score: 85, // This could be calculated based on skills match
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMatch.id)
        .select();

      if (error) {
        console.error('Error updating application:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data, isUpdate: true };
    }

    // Create new application
    const { data, error } = await supabase
      .from('help_request_matches')
      .insert({
        request_id: requestId,
        developer_id: developerId,
        status: 'pending',
        match_score: 85,
        proposed_message: applicationData.proposed_message,
        proposed_duration: applicationData.proposed_duration,
        proposed_rate: applicationData.proposed_rate
      })
      .select();

    if (error) {
      console.error('Error creating application:', error);
      return { success: false, error: error.message };
    }

    // Update the help request status to 'matching' if it was 'pending'
    const { data: requestData, error: requestError } = await supabase
      .from('help_requests')
      .select('status')
      .eq('id', requestId)
      .single();

    if (!requestError && requestData?.status === 'pending') {
      await supabase
        .from('help_requests')
        .update({ status: 'matching' })
        .eq('id', requestId);
    }

    return { success: true, data, isUpdate: false };
  } catch (error) {
    console.error('Exception in submitDeveloperApplication:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Function to get developer applications for a help request
export const getDeveloperApplicationsForRequest = async (requestId: string) => {
  try {
    if (!requestId) {
      return { success: false, error: 'Request ID is required' };
    }

    const { data, error } = await supabase
      .from('help_request_matches')
      .select(`
        *,
        developers:developer_id (
          id,
          profiles (
            name,
            image,
            description
          )
        )
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching developer applications:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception fetching developer applications:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Export the testing functions from helpRequestsDebug module
export * from './helpRequestsDebug';
// Export utility functions
export * from './helpRequestsUtils';
