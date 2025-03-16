import { supabase } from './client';
import { HelpRequest, HelpRequestMatch } from '../../types/helpRequest';
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

// Function to submit a developer application for a help request
export const submitDeveloperApplication = async (
  requestId: string,
  developerId: string,
  applicationData: {
    proposed_message?: string;
    proposed_duration?: number;
    proposed_rate?: number;
  }
) => {
  try {
    console.log('[submitDeveloperApplication] Submitting application with data:', { 
      requestId, 
      developerId, 
      applicationData 
    });
    
    // Ensure the rate is properly formatted
    let formattedRate = applicationData.proposed_rate;
    if (formattedRate !== undefined) {
      // Make sure the rate is a valid numeric with two decimal places and within database limits
      formattedRate = Math.min(Math.max(0, parseFloat(formattedRate.toFixed(2))), 999.99);
    }
    
    // Check for local storage request
    if (isLocalId(requestId)) {
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
          proposed_rate: formattedRate,
          match_score: 85,
          status: 'pending',
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem('help_request_matches', JSON.stringify(localApplications));
        
        // Update the ticket status to 'claimed' if it was 'open'
        const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        const ticketIndex = localHelpRequests.findIndex((req: HelpRequest) => req.id === requestId);
        
        if (ticketIndex >= 0 && localHelpRequests[ticketIndex].status === 'open') {
          localHelpRequests[ticketIndex].status = 'claimed';
          localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
        }
        
        return { success: true, isUpdate: true };
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
        proposed_rate: formattedRate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localApplications.push(newApplication);
      localStorage.setItem('help_request_matches', JSON.stringify(localApplications));
      
      // Update the ticket status to 'claimed' if it was 'open'
      const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
      const ticketIndex = localHelpRequests.findIndex((req: HelpRequest) => req.id === requestId);
      
      if (ticketIndex >= 0 && localHelpRequests[ticketIndex].status === 'open') {
        localHelpRequests[ticketIndex].status = 'claimed';
        localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
      }
      
      return { success: true, isUpdate: false };
    }
    
    // For Supabase help requests
    if (isValidUUID(requestId)) {
      // Check if there's an existing application
      const { data: existing, error: existingError } = await supabase
        .from('help_request_matches')
        .select('id, status')
        .eq('request_id', requestId)
        .eq('developer_id', developerId)
        .maybeSingle();
      
      console.log('[submitDeveloperApplication] Existing application check:', { existing, existingError });
      
      if (existingError) {
        console.error('Error checking for existing application:', existingError);
        throw new Error('Failed to check for existing application');
      }
      
      // If application exists, update it
      if (existing) {
        const { error: updateError } = await supabase
          .from('help_request_matches')
          .update({
            proposed_message: applicationData.proposed_message,
            proposed_duration: applicationData.proposed_duration,
            proposed_rate: formattedRate,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (updateError) {
          console.error('Error updating application:', updateError);
          throw new Error('Failed to update application');
        }
        
        console.log('[submitDeveloperApplication] Successfully updated application:', existing.id);
        
        // If application was accepted, update the ticket status to 'claimed'
        if (existing.status === 'accepted') {
          await supabase
            .from('help_requests')
            .update({ status: 'claimed' })
            .eq('id', requestId)
            .eq('status', 'open');
        }
        
        return { success: true, isUpdate: true };
      }
      
      // Create new application - Debug/test the insertion
      const insertResponse = await supabase
        .from('help_request_matches')
        .insert({
          request_id: requestId,
          developer_id: developerId,
          status: 'pending',
          match_score: 85,
          proposed_message: applicationData.proposed_message,
          proposed_duration: applicationData.proposed_duration,
          proposed_rate: formattedRate
        });
      
      if (insertResponse.error) {
        console.error('Error creating application:', insertResponse.error);
        throw new Error('Failed to create application: ' + insertResponse.error.message);
      }
      
      console.log('[submitDeveloperApplication] Application created successfully:', insertResponse.data);
      
      // Manually create notification if trigger doesn't work
      try {
        // Get help request details for notification
        const { data: requestData } = await supabase
          .from('help_requests')
          .select('client_id, title')
          .eq('id', requestId)
          .single();
          
        // Get developer profile for notification
        const { data: developerData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', developerId)
          .single();
          
        if (requestData && developerData) {
          // Create notification for client
          const notificationResponse = await supabase
            .from('notifications')
            .insert({
              user_id: requestData.client_id,
              related_entity_id: requestId,
              entity_type: 'application',
              title: 'New Developer Application',
              message: `Developer ${developerData.name} has applied to help with your request: ${requestData.title}`
            });
            
          console.log('[submitDeveloperApplication] Notification created:', notificationResponse);
        }
      } catch (notifError) {
        console.error('Error creating notification manually:', notifError);
        // Don't fail the whole application process if notification fails
      }
      
      // Update the ticket status to 'claimed' from 'open'
      const { error: updateTicketError } = await supabase
        .from('help_requests')
        .update({ status: 'claimed' })
        .eq('id', requestId)
        .eq('status', 'open');
      
      if (updateTicketError) {
        console.error('Error updating ticket status:', updateTicketError);
        // Don't throw here, the application was created successfully
      } else {
        console.log('[submitDeveloperApplication] Updated ticket status to claimed');
      }
      
      return { success: true, isUpdate: false };
    }
    
    return { success: false, error: 'Invalid request ID format' };
    
  } catch (error) {
    console.error('Exception submitting application:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
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

// Function to get developer applications for a help request
export const getDeveloperApplicationsForRequest = async (requestId: string) => {
  try {
    if (!requestId) {
      return { success: false, error: 'Request ID is required' };
    }

    // For local storage help requests
    if (isLocalId(requestId)) {
      const localApplications = JSON.parse(localStorage.getItem('help_request_matches') || '[]');
      const matchingApplications = localApplications.filter(
        (app: any) => app.request_id === requestId
      );
      
      return { success: true, data: matchingApplications };
    }

    // For database help requests
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

// Function to approve or reject a developer application
export const updateApplicationStatus = async (
  applicationId: string, 
  status: 'approved' | 'rejected' | 'completed',
  clientId: string
) => {
  try {
    if (!applicationId || !status || !clientId) {
      return { success: false, error: 'Missing required fields' };
    }

    // For local storage applications
    if (applicationId.startsWith('app-')) {
      const localApplications = JSON.parse(localStorage.getItem('help_request_matches') || '[]');
      const applicationIndex = localApplications.findIndex((app: any) => app.id === applicationId);
      
      if (applicationIndex === -1) {
        return { success: false, error: 'Application not found' };
      }
      
      // Update the application status
      localApplications[applicationIndex].status = status;
      localApplications[applicationIndex].updated_at = new Date().toISOString();
      
      localStorage.setItem('help_request_matches', JSON.stringify(localApplications));
      
      // If approved, also update the help request status
      if (status === 'approved') {
        const requestId = localApplications[applicationIndex].request_id;
        const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        const requestIndex = localHelpRequests.findIndex((req: any) => req.id === requestId);
        
        if (requestIndex >= 0) {
          localHelpRequests[requestIndex].status = 'in-progress';
          localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
        }
      }
      
      return { success: true, data: localApplications[applicationIndex] };
    }

    // For database applications
    const { data: applicationData, error: applicationError } = await supabase
      .from('help_request_matches')
      .select('request_id, developer_id')
      .eq('id', applicationId)
      .single();
      
    if (applicationError) {
      console.error('Error getting application:', applicationError);
      return { success: false, error: applicationError.message };
    }
    
    // Check if the user is the client for this help request
    const { data: requestData, error: requestError } = await supabase
      .from('help_requests')
      .select('client_id')
      .eq('id', applicationData.request_id)
      .single();
      
    if (requestError) {
      console.error('Error getting help request:', requestError);
      return { success: false, error: requestError.message };
    }
    
    if (requestData.client_id !== clientId) {
      return { success: false, error: 'You are not authorized to update this application' };
    }
    
    // Update the application status
    const { data, error } = await supabase
      .from('help_request_matches')
      .update({ status })
      .eq('id', applicationId)
      .select();

    if (error) {
      console.error('Error updating application status:', error);
      return { success: false, error: error.message };
    }
    
    // If approved, also update the help request status and reject other applications
    if (status === 'approved') {
      // Update help request status
      await supabase
        .from('help_requests')
        .update({ status: 'in-progress' })
        .eq('id', applicationData.request_id);
        
      // Reject other applications for this request
      await supabase
        .from('help_request_matches')
        .update({ status: 'rejected' })
        .eq('request_id', applicationData.request_id)
        .neq('id', applicationId);
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Exception updating application status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Add a test function to directly check database access
export const testDatabaseAccess = async () => {
  try {
    console.log('[testDatabaseAccess] Running test...');
    
    // First check authentication status
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[testDatabaseAccess] Auth error:', sessionError);
      return { success: false, error: sessionError, authenticated: false };
    }
    
    if (!sessionData.session) {
      console.log('[testDatabaseAccess] No active session found');
      return { success: false, error: 'No active session', authenticated: false };
    }
    
    console.log('[testDatabaseAccess] User authenticated:', sessionData.session.user.id);
    console.log('[testDatabaseAccess] User metadata:', sessionData.session.user.user_metadata);
    
    // Try to count help_requests
    const { count, error: countError } = await supabase
      .from('help_requests')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('[testDatabaseAccess] Error counting help_requests:', countError);
      return { success: false, error: countError, authenticated: true };
    }
    
    console.log('[testDatabaseAccess] Help requests count:', count);
    
    // Try to fetch a few records
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('[testDatabaseAccess] Error fetching help_requests:', error);
      return { success: false, error, authenticated: true, count };
    }
    
    console.log('[testDatabaseAccess] Sample help requests:', data?.length);
    data?.forEach((item, i) => {
      console.log(`[testDatabaseAccess] Request ${i+1}:`, {
        id: item.id,
        title: item.title,
        status: item.status,
        client_id: item.client_id
      });
    });
    
    return { 
      success: true, 
      count, 
      sampleData: data?.length,
      authenticated: true
    };
  } catch (error) {
    console.error('[testDatabaseAccess] Exception:', error);
    return { success: false, error, authenticated: false };
  }
};

// Export the testing functions from helpRequestsDebug module
export * from './helpRequestsDebug';
// Export utility functions
export * from './helpRequestsUtils';
