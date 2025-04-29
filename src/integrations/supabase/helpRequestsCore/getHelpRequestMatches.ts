
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

    // Get all applications with their help request information in one query
    const { data, error } = await supabase
      .from('help_request_matches')
      .select('*, help_requests!inner(id, client_id, title)')
      .eq('status', 'pending')
      .eq('help_requests.client_id', clientId);
      
    if (error || !data) {
      console.error('[getPendingApplicationsForClient] Error fetching data:', error?.message || 'No data returned');
      return { 
        success: false, 
        error: error?.message || 'Failed to fetch applications', 
        data: {} 
      };
    }
    
    console.log('[getPendingApplicationsForClient] Found', data.length, 'pending applications');
    
    // Group applications by request_id manually in JavaScript
    const pendingApplicationsGrouped: Record<string, number> = {};
    
    data.forEach(application => {
      const ticketId = application.request_id;
      if (!pendingApplicationsGrouped[ticketId]) {
        pendingApplicationsGrouped[ticketId] = 1;
      } else {
        pendingApplicationsGrouped[ticketId] += 1;
      }
    });
    
    console.log('[getPendingApplicationsForClient] Grouped pending applications:', pendingApplicationsGrouped);
    
    return { 
      success: true, 
      data: pendingApplicationsGrouped 
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
