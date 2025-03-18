
import { HelpRequest, HelpRequestMatch } from '../../types/helpRequest';
import { 
  createHelpRequest as createHelpRequestCore,
  getHelpRequestsForClient,
  getAllPublicHelpRequests,
  getHelpRequest,
  updateHelpRequest
} from './helpRequestsCore';

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

// Export other functions as is
export { 
  getHelpRequestsForClient,
  getAllPublicHelpRequests,
  getHelpRequest,
  updateHelpRequest
};
