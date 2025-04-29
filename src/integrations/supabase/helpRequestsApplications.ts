
import { supabase } from './client';
import { toast } from 'sonner';
import { HelpRequestMatch, ApplicationStatus } from '../../types/helpRequest';

// Define valid application statuses to be used throughout the application
export const VALID_MATCH_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved_by_client',
  REJECTED: 'rejected_by_client',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

type ApplicationStatusUpdateResult = {
  success: boolean;
  error?: string;
};

type ApplicationQueryResult = {
  success: boolean;
  data?: HelpRequestMatch[];
  error?: string;
};

/**
 * Updates the status of a help request application
 * 
 * @param applicationId ID of the application to update
 * @param status The new status (approved, rejected)
 * @param clientId ID of the client updating the application
 * @returns Result object indicating success or failure
 */
export const updateApplicationStatus = async (
  applicationId: string,
  status: 'approved' | 'rejected',
  clientId: string
): Promise<ApplicationStatusUpdateResult> => {
  try {
    if (!applicationId || !status || !clientId) {
      return {
        success: false,
        error: 'Missing required parameters'
      };
    }

    console.log(`Updating application ${applicationId} to ${status} by client ${clientId}`);

    // Map the input status to the valid DB values
    const dbStatus = status === 'approved' ? VALID_MATCH_STATUSES.APPROVED : VALID_MATCH_STATUSES.REJECTED;

    // First get the application to verify ownership
    const { data: application, error: fetchError } = await supabase
      .from('help_request_matches')
      .select('request_id, developer_id')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      console.error('Error fetching application:', fetchError);
      return {
        success: false,
        error: fetchError.message
      };
    }

    if (!application) {
      return {
        success: false,
        error: 'Application not found'
      };
    }

    // Verify if the user owns the help request
    const { data: helpRequest, error: helpRequestError } = await supabase
      .from('help_requests')
      .select('client_id')
      .eq('id', application.request_id)
      .single();

    if (helpRequestError) {
      console.error('Error fetching help request:', helpRequestError);
      return {
        success: false,
        error: helpRequestError.message
      };
    }

    if (helpRequest.client_id !== clientId) {
      return {
        success: false,
        error: 'You do not have permission to update this application'
      };
    }

    // Update the application status
    const { error: updateError } = await supabase
      .from('help_request_matches')
      .update({ status: dbStatus })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return {
        success: false,
        error: updateError.message
      };
    }

    // If approved, update the help request status and set selected developer
    if (status === 'approved') {
      const { error: helpRequestUpdateError } = await supabase
        .from('help_requests')
        .update({ 
          status: 'approved', 
          selected_developer_id: application.developer_id 
        })
        .eq('id', application.request_id);

      if (helpRequestUpdateError) {
        console.error('Error updating help request:', helpRequestUpdateError);
        toast.error('Failed to update help request status');
        // Continue anyway, the application status was updated
      }
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Unexpected error updating application status:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
};

/**
 * Fetches all developer applications for a specific help request
 * 
 * @param requestId ID of the help request
 * @returns Result object with applications data or error message
 */
export const getDeveloperApplicationsForRequest = async (
  requestId: string
): Promise<ApplicationQueryResult> => {
  try {
    if (!requestId) {
      return {
        success: false,
        error: 'Request ID is required'
      };
    }
    
    const { data, error } = await supabase
      .from('help_request_matches')
      .select(`
        *,
        profiles:developer_id (id, name, image, description, location),
        developer_profiles:developer_id (id, skills, experience, hourly_rate)
      `)
      .eq('request_id', requestId);
      
    if (error) {
      console.error('Error fetching applications:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Process the data to ensure all required fields exist
    const processedData = (data || []).map(app => {
      // Handle potentially malformed profiles data
      let safeProfiles = app.profiles;
      
      if (!safeProfiles || typeof safeProfiles !== 'object') {
        safeProfiles = { 
          id: app.developer_id, 
          name: 'Unknown Developer',
          image: null,
          description: '',
          location: ''
        };
      } else if (!safeProfiles.description) {
        safeProfiles.description = '';
      } else if (!safeProfiles.location) {
        safeProfiles.location = '';
      }
      
      // Handle potentially malformed developer_profiles data
      let safeDeveloperProfiles = app.developer_profiles;
      
      if (!safeDeveloperProfiles || typeof safeDeveloperProfiles !== 'object') {
        safeDeveloperProfiles = {
          id: app.developer_id,
          skills: [],
          experience: '',
          hourly_rate: 0
        };
      }
      
      return {
        ...app,
        profiles: safeProfiles,
        developer_profiles: safeDeveloperProfiles
      } as HelpRequestMatch;
    });
    
    return { 
      success: true, 
      data: processedData 
    };
  } catch (error) {
    console.error('Unexpected error fetching applications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

/**
 * Checks the application status for a developer on a specific help request
 * 
 * @param helpRequestId ID of the help request
 * @param developerId ID of the developer
 * @returns Application status or null if no application exists
 */
export const checkApplicationStatus = async (
  helpRequestId: string,
  developerId: string
): Promise<string | null> => {
  try {
    if (!helpRequestId || !developerId) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('help_request_matches')
      .select('status')
      .eq('request_id', helpRequestId)
      .eq('developer_id', developerId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking application status:', error);
      return null;
    }
    
    return data?.status || null;
  } catch (error) {
    console.error('Unexpected error checking application status:', error);
    return null;
  }
};

/**
 * Submits a developer application for a help request
 * 
 * @param requestId ID of the help request
 * @param developerId ID of the developer
 * @param applicationData Additional application data
 * @returns Result object indicating success or failure
 */
export const submitDeveloperApplication = async (
  requestId: string,
  developerId: string,
  applicationData: {
    proposed_message?: string;
    proposed_duration?: number;
    proposed_rate?: number;
  }
): Promise<ApplicationStatusUpdateResult> => {
  try {
    if (!requestId || !developerId) {
      return {
        success: false,
        error: 'Missing required parameters'
      };
    }

    // Check if developer already applied to this request
    const { data: existingApplication, error: checkError } = await supabase
      .from('help_request_matches')
      .select('id')
      .eq('request_id', requestId)
      .eq('developer_id', developerId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing application:', checkError);
      return {
        success: false,
        error: checkError.message
      };
    }

    if (existingApplication) {
      return {
        success: false,
        error: 'You have already applied to this help request'
      };
    }

    // Submit the application
    const { error: insertError } = await supabase
      .from('help_request_matches')
      .insert({
        request_id: requestId,
        developer_id: developerId,
        status: VALID_MATCH_STATUSES.PENDING,
        proposed_message: applicationData.proposed_message || '',
        proposed_duration: applicationData.proposed_duration || null,
        proposed_rate: applicationData.proposed_rate || null,
      });

    if (insertError) {
      console.error('Error submitting application:', insertError);
      return {
        success: false,
        error: insertError.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Unexpected error submitting application:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
};
