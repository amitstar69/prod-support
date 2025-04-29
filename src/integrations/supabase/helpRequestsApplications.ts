
import { supabase } from './client';
import { MATCH_STATUSES } from '../../utils/constants/statusConstants';
import { toast } from 'sonner';
import { DeveloperProfile } from '../../types/helpRequest';

// Export valid match statuses for use in other components
export const VALID_MATCH_STATUSES = MATCH_STATUSES;

/**
 * Update the status of a help request application
 */
export const updateApplicationStatus = async (
  applicationId: string, 
  status: 'approved' | 'rejected',
  userId: string
) => {
  try {
    let statusValue = status === 'approved' 
      ? MATCH_STATUSES.APPROVED_BY_CLIENT 
      : MATCH_STATUSES.REJECTED_BY_CLIENT;
    
    const { data, error } = await supabase
      .from('help_request_matches')
      .update({
        status: statusValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select();

    if (error) {
      console.error('[helpRequestsApplications] Error updating application status:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // If approved, reject all other applications
    if (status === 'approved' && data && data[0]) {
      const requestId = data[0].request_id;
      
      await supabase
        .from('help_request_matches')
        .update({
          status: MATCH_STATUSES.REJECTED_BY_CLIENT,
          updated_at: new Date().toISOString()
        })
        .eq('request_id', requestId)
        .neq('id', applicationId);
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('[helpRequestsApplications] Error in updateApplicationStatus:', err);
    return {
      success: false,
      error: 'Failed to update application status',
    };
  }
};

/**
 * Fetch pending developer applications for a specific help request
 */
export const getDeveloperApplicationsForRequest = async (requestId: string) => {
  try {
    const { data, error } = await supabase
      .from('help_request_matches')
      .select(`
        *,
        profiles:developer_id (id, name, image, description, location),
        developer_profiles:developer_id (id, skills, experience, hourly_rate)
      `)
      .eq('request_id', requestId);
      
    if (error) {
      console.error('[helpRequestsApplications] Error fetching developer applications:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Process and normalize the data to handle potentially missing profile info
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
      let safeDeveloperProfiles: DeveloperProfile;
      
      if (app.developer_profiles && typeof app.developer_profiles === 'object') {
        const dp = app.developer_profiles;
        safeDeveloperProfiles = {
          id: app.developer_id,
          skills: Array.isArray(dp?.skills) ? dp?.skills : [],
          experience: typeof dp?.experience === 'string' ? dp?.experience : '',
          hourly_rate: typeof dp?.hourly_rate === 'number' ? dp?.hourly_rate : 0
        };
      } else {
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
      };
    });

    return {
      success: true,
      data: processedData
    };
  } catch (err) {
    console.error('[helpRequestsApplications] Error in getDeveloperApplicationsForRequest:', err);
    return {
      success: false,
      error: 'Failed to fetch developer applications'
    };
  }
};

/**
 * Submit a developer application for a help request
 */
export const submitDeveloperApplication = async (
  requestId: string,
  developerId: string,
  proposedMessage: string,
  proposedRate?: number,
  proposedDuration?: number
) => {
  try {
    // Check if the developer has already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('help_request_matches')
      .select('id')
      .eq('request_id', requestId)
      .eq('developer_id', developerId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[helpRequestsApplications] Error checking for existing application:', checkError);
      return {
        success: false,
        error: checkError.message
      };
    }

    // If the developer has already applied, return an error
    if (existingApplication) {
      return {
        success: false,
        error: 'You have already applied to this help request'
      };
    }

    // Insert the new application
    const { data, error } = await supabase
      .from('help_request_matches')
      .insert({
        request_id: requestId,
        developer_id: developerId,
        status: MATCH_STATUSES.PENDING,
        proposed_message: proposedMessage,
        proposed_rate: proposedRate,
        proposed_duration: proposedDuration
      })
      .select('*')
      .single();

    if (error) {
      console.error('[helpRequestsApplications] Error submitting application:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (err) {
    console.error('[helpRequestsApplications] Error in submitDeveloperApplication:', err);
    return {
      success: false,
      error: 'Failed to submit application'
    };
  }
};
