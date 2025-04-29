
import { useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { submitDeveloperApplication } from '../../integrations/supabase/helpRequestsApplications';
import { MATCH_STATUSES } from '../../utils/constants/statusConstants';
import { toast } from 'sonner';

export const useTicketApplicationActions = (
  isAuthenticated: boolean,
  userId: string | null,
  userType: string | null,
  refreshTickets: () => void,
  fetchMyApplications: (isAuthenticated: boolean, userId: string | null) => Promise<void>
) => {
  const handleClaimTicket = useCallback(
    async (ticketId: string) => {
      if (!isAuthenticated || !userId) {
        toast.error('Please log in to apply for tickets');
        return;
      }

      if (userType !== 'developer') {
        toast.error('Only developers can apply for tickets');
        return;
      }

      try {
        // Simple message for now - could be expanded to include more details
        const message = "I'd like to help with this request!";
        
        const result = await submitDeveloperApplication(
          ticketId,
          userId,
          message,
          undefined,  // proposed rate
          undefined   // proposed duration
        );

        if (result.success) {
          toast.success('Successfully applied to help request!');
          refreshTickets();
          await fetchMyApplications(isAuthenticated, userId);
        } else {
          toast.error(result.error || 'Failed to apply to help request');
        }
      } catch (error) {
        console.error('Failed to claim ticket:', error);
        toast.error('An unexpected error occurred');
      }
    },
    [isAuthenticated, userId, userType, refreshTickets, fetchMyApplications]
  );

  const checkApplicationStatus = useCallback(
    async (ticketId: string, userId: string) => {
      try {
        // Check if user has already applied to this ticket
        const { data, error } = await supabase
          .from('help_request_matches')
          .select('status')
          .eq('request_id', ticketId)
          .eq('developer_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking application:', error);
          return null;
        }

        return data?.status || null;
      } catch (err) {
        console.error('Error in checkApplicationStatus:', err);
        return null;
      }
    },
    []
  );

  return { handleClaimTicket, checkApplicationStatus };
};
