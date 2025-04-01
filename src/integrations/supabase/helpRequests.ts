
import { HelpRequest, HelpRequestMatch } from '../../types/helpRequest';
import { 
  createHelpRequest as createHelpRequestCore,
  getHelpRequestsForClient,
  getAllPublicHelpRequests,
  getHelpRequest,
  updateHelpRequest
} from './helpRequestsCore';
import { testHelpRequestsTableAccess as testDatabaseAccess } from './helpRequestsDebug';
import { submitDeveloperApplication, getDeveloperApplicationsForRequest } from './helpRequestsApplications';

// Create a help request
export const createHelpRequest = async (helpRequest: Omit<HelpRequest, 'id' | 'created_at' | 'updated_at' | 'ticket_number'>) => {
  console.log('Creating help request with optimized function', helpRequest);
  try {
    // Call the core function with the request
    const result = await createHelpRequestCore(helpRequest);
    console.log('Help request creation result:', result);
    return result;
  } catch (error) {
    console.error('Error in createHelpRequest wrapper:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error in help request creation' 
    };
  }
};

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

// Export other functions as is
export { 
  getHelpRequestsForClient,
  getAllPublicHelpRequests,
  getHelpRequest,
  updateHelpRequest,
  testDatabaseAccess,
  submitDeveloperApplication,
  getDeveloperApplicationsForRequest
};
