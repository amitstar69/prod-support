
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
      const { data: applications, error } = await supabase
        .from('help_request_matches')
        .select('*, help_requests(*)')
        .eq('developer_id', currentUserId)
        .eq('status', VALID_MATCH_STATUSES.APPROVED);

      if (error) {
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
    } catch {
      toast.error('An unexpected error occurred while fetching your applications');
      setMyApplications([]);
    }
  };

  return { myApplications, fetchMyApplications };
};
