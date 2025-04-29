
import { supabase } from '../client';
import { isValidUUID } from './utils';
import { toast } from 'sonner';

/**
 * Fetches pending applications for a client, grouped by ticket ID
 * 
 * @param clientId The client's user ID
 * @returns A mapping of ticket IDs to their pending application counts
 */
export const getPendingApplicationsForClient = async (clientId: string) => {
  try {
    console.log('[getPendingApplicationsForClient] Fetching applications for client:', clientId);

    if (!isValidUUID(clientId)) {
      console.error('[getPendingApplicationsForClient] Invalid client ID format');
      return { 
        success: false, 
        error: 'Invalid client ID format', 
        data: {} 
      };
    }

    // First, get all help request IDs for this client
    const { data: helpRequests, error: helpRequestsError } = await supabase
      .from('help_requests')
      .select('id')
      .eq('client_id', clientId);
      
    if (helpRequestsError) {
      console.error('[getPendingApplicationsForClient] Error fetching help requests:', helpRequestsError);
      return { 
        success: false, 
        error: helpRequestsError.message, 
        data: {} 
      };
    }
    
    if (!helpRequests || helpRequests.length === 0) {
      console.log('[getPendingApplicationsForClient] No help requests found for client');
      return { 
        success: true, 
        data: {} 
      };
    }
    
    const requestIds = helpRequests.map(request => request.id);
    
    // Then, fetch all pending applications for these request IDs
    const { data, error } = await supabase
      .from('help_request_matches')
      .select('request_id')
      .eq('status', 'pending')
      .in('request_id', requestIds);
      
    if (error) {
      console.error('[getPendingApplicationsForClient] Error fetching applications:', error);
      return { 
        success: false, 
        error: error.message, 
        data: {} 
      };
    }
    
    if (!data || data.length === 0) {
      console.log('[getPendingApplicationsForClient] No pending applications found');
      return {
        success: true,
        data: {}
      };
    }
    
    // Group applications by request_id and count them
    const applicationCountsByRequestId: Record<string, number> = {};
    
    data.forEach(application => {
      const requestId = application.request_id;
      if (!applicationCountsByRequestId[requestId]) {
        applicationCountsByRequestId[requestId] = 1;
      } else {
        applicationCountsByRequestId[requestId] += 1;
      }
    });
    
    console.log('[getPendingApplicationsForClient] Grouped pending applications:', applicationCountsByRequestId);
    
    return { 
      success: true, 
      data: applicationCountsByRequestId 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getPendingApplicationsForClient] Exception:', error);
    return { 
      success: false, 
      error: errorMessage, 
      data: {} 
    };
  }
};
