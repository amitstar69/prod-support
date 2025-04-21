
import { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { VALID_MATCH_STATUSES } from '../../integrations/supabase/helpRequestsApplications';

export const useMyTicketApplications = () => {
  const [myApplications, setMyApplications] = useState<HelpRequest[]>([]);

  const fetchMyApplications = async (
    isAuthenticated: boolean,
    currentUserId: string | null
  ) => {
    if (!isAuthenticated || !currentUserId) {
      setMyApplications([]);
      return;
    }
    
    try {
      // Create a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('Fetch applications request timed out');
      }, 10000); // 10 second timeout
      
      const { data: applications, error } = await supabase
        .from('help_request_matches')
        .select('*, help_requests(*)')
        .eq('developer_id', currentUserId)
        .eq('status', VALID_MATCH_STATUSES.APPROVED)
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);

      if (error) {
        console.error('Failed to load applications:', error);
        toast.error('Failed to load your approved applications');
        setMyApplications([]);
        return;
      }
      
      if (!applications || applications.length === 0) {
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
      
      setMyApplications(approvedTickets);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Request timed out. Please check your connection');
      } else {
        toast.error('An unexpected error occurred while fetching your applications');
      }
      console.error('Error fetching applications:', error);
      setMyApplications([]);
    }
  };

  return { myApplications, fetchMyApplications };
};
