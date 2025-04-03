
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
