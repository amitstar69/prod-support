
import { supabase } from './client';
import { toast } from 'sonner';

type ApplicationStatusUpdateResult = {
  success: boolean;
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
      .update({ status })
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
