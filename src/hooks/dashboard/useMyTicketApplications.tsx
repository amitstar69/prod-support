
import { useState, useCallback } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { VALID_MATCH_STATUSES } from '../../integrations/supabase/helpRequestsApplications';

export const useMyTicketApplications = () => {
  const [myApplications, setMyApplications] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyApplications = useCallback(async (
    isAuthenticated: boolean,
    currentUserId: string | null
  ) => {
    console.log('[Applications] Fetching applications for user', currentUserId);
    
    if (!isAuthenticated || !currentUserId) {
      console.log('[Applications] User not authenticated or no user ID');
      setMyApplications([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('[Applications] Request timed out');
      }, 10000);
      
      const { data: applications, error } = await supabase
        .from('help_request_matches')
        .select('*, help_requests(*)')
        .eq('developer_id', currentUserId)
        .eq('status', VALID_MATCH_STATUSES.APPROVED)
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);

      if (error) {
        console.error('[Applications] Failed to load applications:', error);
        toast.error('Failed to load your approved applications');
        setMyApplications([]);
        return;
      }
      
      console.log('[Applications] Loaded applications:', applications?.length || 0);
      
      if (!applications || applications.length === 0) {
        console.log('[Applications] No applications found');
        setMyApplications([]);
        return;
      }
      
      const approvedTickets = applications
        .filter(app => app.help_requests)
        .map(app => ({
          ...app.help_requests,
          developer_id: currentUserId,
          application_id: app.id,
          application_status: app.status
        })) as HelpRequest[];
      
      console.log('[Applications] Processed approved tickets:', approvedTickets.length);
      setMyApplications(approvedTickets);
    } catch (error) {
      console.error('[Applications] Error fetching applications:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Request timed out. Please check your connection');
      } else {
        toast.error('An unexpected error occurred while fetching your applications');
      }
      setMyApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { myApplications, fetchMyApplications, isLoading };
};
