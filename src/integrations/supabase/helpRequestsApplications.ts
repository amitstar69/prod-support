
import { supabase } from './client';
import { HelpRequestMatch } from '../../types/helpRequest';
import { isValidUUID, isLocalId } from './helpRequestsUtils';
import { enableRealtimeForTable } from './setupRealtime';

// Constants to prevent numeric overflow
const MAX_RATE = 999.99; // Maximum rate in USD
const MAX_DURATION = 480; // Maximum duration in minutes (8 hours)

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
    
    // Validate and format input values to prevent database overflow
    let validatedData = { ...applicationData };
    
    // Ensure the rate is properly formatted and within limits
    if (validatedData.proposed_rate !== undefined) {
      // Make sure the rate is a valid numeric with two decimal places and within limits
      // The help_request_matches.proposed_rate is defined as numeric(10,2)
      validatedData.proposed_rate = Math.min(
        Math.max(0, parseFloat(validatedData.proposed_rate.toFixed(2))), 
        MAX_RATE
      );
      console.log('[submitDeveloperApplication] Validated rate:', validatedData.proposed_rate);
    }
    
    // Ensure duration is within limits
    if (validatedData.proposed_duration !== undefined) {
      validatedData.proposed_duration = Math.min(
        Math.max(15, validatedData.proposed_duration), 
        MAX_DURATION
      );
      console.log('[submitDeveloperApplication] Validated duration:', validatedData.proposed_duration);
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
          proposed_message: validatedData.proposed_message,
          proposed_duration: validatedData.proposed_duration,
          proposed_rate: validatedData.proposed_rate,
          match_score: 85,
          status: 'pending',
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem('help_request_matches', JSON.stringify(localApplications));
        
        // Update the ticket status to 'claimed' if it was 'open'
        const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        const ticketIndex = localHelpRequests.findIndex((req: any) => req.id === requestId);
        
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
        proposed_message: validatedData.proposed_message,
        proposed_duration: validatedData.proposed_duration,
        proposed_rate: validatedData.proposed_rate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localApplications.push(newApplication);
      localStorage.setItem('help_request_matches', JSON.stringify(localApplications));
      
      // Update the ticket status to 'claimed' if it was 'open'
      const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
      const ticketIndex = localHelpRequests.findIndex((req: any) => req.id === requestId);
      
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
        const updatePayload: Record<string, any> = {
          proposed_message: validatedData.proposed_message,
          updated_at: new Date().toISOString()
        };
        
        // Only include duration if it's provided
        if (validatedData.proposed_duration !== undefined) {
          updatePayload.proposed_duration = validatedData.proposed_duration;
        }
        
        // Only include rate if it's provided
        if (validatedData.proposed_rate !== undefined) {
          updatePayload.proposed_rate = validatedData.proposed_rate;
        }

        const { error: updateError } = await supabase
          .from('help_request_matches')
          .update(updatePayload)
          .eq('id', existing.id);
        
        if (updateError) {
          console.error('Error updating application:', updateError);
          throw new Error('Failed to update application: ' + updateError.message);
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
      
      // Create new application - Fix the insert payload to ensure all required fields are present
      const insertPayload = {
        request_id: requestId,
        developer_id: developerId,
        status: 'pending',
        match_score: 85,
        proposed_message: validatedData.proposed_message,
        proposed_duration: validatedData.proposed_duration !== undefined ? validatedData.proposed_duration : null,
        proposed_rate: validatedData.proposed_rate !== undefined ? validatedData.proposed_rate : null
      };

      // Create new application with properly typed payload
      const insertResponse = await supabase
        .from('help_request_matches')
        .insert(insertPayload);
      
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
      
      // Check if we need to trigger realtime notifications manually
      try {
        // Enable realtime for notifications table if needed
        const realtimeSetup = await enableRealtimeForTable('notifications');
        console.log('Realtime setup result:', realtimeSetup);
      } catch (rtError) {
        console.error('Error setting up realtime:', rtError);
        // Don't block the main flow
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
