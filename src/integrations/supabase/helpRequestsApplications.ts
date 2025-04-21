
import { supabase } from './client';
import { ApplicationStatus, HelpRequestMatch } from '../../types/helpRequest';

// Export constants for valid match status values
export const VALID_MATCH_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Submit a developer application for a help request
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
    console.log('Submitting application for request:', requestId, 'developer:', developerId);
    
    // Check if the developer has already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('help_request_matches')
      .select('id, status')
      .eq('request_id', requestId)
      .eq('developer_id', developerId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing application:', checkError);
      return { success: false, error: 'Failed to check existing application status' };
    }
    
    // If developer already applied, return appropriate message
    if (existingApplication) {
      console.log('Developer already applied with status:', existingApplication.status);
      return { 
        success: false, 
        error: `You have already applied to this request (Status: ${existingApplication.status})`,
        isUpdate: false
      };
    }
    
    // Format and validate rate
    let rate = applicationData.proposed_rate;
    if (rate !== undefined) {
      // Ensure rate is a valid numeric with 2 decimal places
      rate = Math.round(rate * 100) / 100;
    }
    
    // Submit the new application
    const { data, error } = await supabase
      .from('help_request_matches')
      .insert({
        request_id: requestId,
        developer_id: developerId,
        status: VALID_MATCH_STATUSES.PENDING,
        proposed_message: applicationData.proposed_message || null,
        proposed_duration: applicationData.proposed_duration || null,
        proposed_rate: rate || null,
        match_score: 0.8 // Default score
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting developer application:', error);
      return { success: false, error: error.message, isUpdate: false };
    }
    
    return { success: true, data, isUpdate: false };
  } catch (error) {
    console.error('Exception submitting developer application:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error submitting application',
      isUpdate: false
    };
  }
};

// Get developer applications for a specific request
export const getDeveloperApplicationsForRequest = async (requestId: string) => {
  try {
    // Get applications for this request
    const { data, error } = await supabase
      .from('help_request_matches')
      .select(`
        id,
        request_id,
        developer_id,
        status,
        proposed_message,
        proposed_duration,
        proposed_rate,
        created_at,
        updated_at,
        profiles:developer_id (id, name, image, description)
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
      error: error instanceof Error ? error.message : 'Unknown error fetching applications' 
    };
  }
};

// Get all applications for a specific developer
export const getDeveloperApplications = async (developerId: string) => {
  try {
    // Get all applications submitted by this developer
    const { data, error } = await supabase
      .from('help_request_matches')
      .select(`
        id,
        request_id,
        developer_id,
        status,
        proposed_message,
        proposed_duration,
        proposed_rate,
        created_at,
        updated_at,
        help_requests:request_id (*)
      `)
      .eq('developer_id', developerId)
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
      error: error instanceof Error ? error.message : 'Unknown error fetching applications' 
    };
  }
};

// Update status of a developer application
export const updateApplicationStatus = async (
  applicationId: string, 
  status: ApplicationStatus,
  clientId: string
) => {
  try {
    // Verify that the application exists and get the associated request
    const { data: applicationData, error: fetchError } = await supabase
      .from('help_request_matches')
      .select(`
        id,
        request_id,
        help_requests:request_id (client_id)
      `)
      .eq('id', applicationId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching application:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (!applicationData) {
      return { success: false, error: 'Application not found' };
    }
    
    // Verify the client is authorized to update this application
    if (applicationData.help_requests.client_id !== clientId) {
      return { success: false, error: 'You are not authorized to update this application' };
    }
    
    // Update the application status
    const { data, error } = await supabase
      .from('help_request_matches')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating application status:', error);
      return { success: false, error: error.message };
    }
    
    // If the status is approved, update the help request status and reject all other applications
    if (status === VALID_MATCH_STATUSES.APPROVED) {
      // Update the help request status
      const { error: updateRequestError } = await supabase
        .from('help_requests')
        .update({ status: 'approved' })
        .eq('id', applicationData.request_id);
      
      if (updateRequestError) {
        console.error('Error updating help request status:', updateRequestError);
        // We don't return an error here as the application status update was successful
      }
      
      // Reject all other applications for this request
      const { error: rejectOthersError } = await supabase
        .from('help_request_matches')
        .update({ status: VALID_MATCH_STATUSES.REJECTED })
        .eq('request_id', applicationData.request_id)
        .neq('id', applicationId);
      
      if (rejectOthersError) {
        console.error('Error rejecting other applications:', rejectOthersError);
        // We don't return an error here as the primary operation was successful
      }
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception updating application status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error updating application status' 
    };
  }
};
