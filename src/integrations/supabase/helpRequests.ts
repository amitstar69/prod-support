
import { HelpRequest, HelpRequestMatch } from '../../types/helpRequest';
import { 
  createHelpRequest,
  getHelpRequestsForClient,
  getAllPublicHelpRequests,
  getHelpRequest,
  updateHelpRequest
} from './helpRequestsCore';
import { testHelpRequestsTableAccess as testDatabaseAccess } from './helpRequestsDebug';
import { submitDeveloperApplication, getDeveloperApplicationsForRequest } from './helpRequestsApplications';
import { supabase } from './client';

// Get help request history
export const getHelpRequestHistory = async (requestId: string) => {
  try {
    if (!requestId) {
      return { success: false, error: 'Request ID is required' };
    }
    
    const { data, error } = await supabase
      .from('help_request_history')
      .select('*')
      .eq('help_request_id', requestId)
      .order('changed_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching help request history:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception fetching help request history:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error fetching history' 
    };
  }
};

// Check if help request exists (ignoring RLS)
export const checkHelpRequestExists = async (requestId: string) => {
  try {
    if (!requestId) {
      return { success: false, error: 'Request ID is required' };
    }
    
    // Instead of using RPC, use a direct query
    const { data, error } = await supabase
      .from('help_requests')
      .select('id')
      .eq('id', requestId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking help request existence:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: !!data };
  } catch (error) {
    console.error('Exception checking help request existence:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error checking request existence' 
    };
  }
};

// Export all functions from the core module
export {
  createHelpRequest,
  getHelpRequestsForClient,
  getAllPublicHelpRequests,
  getHelpRequest,
  updateHelpRequest,
  testDatabaseAccess,
  submitDeveloperApplication,
  getDeveloperApplicationsForRequest
};
