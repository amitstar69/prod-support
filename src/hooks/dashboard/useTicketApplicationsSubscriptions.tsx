
import { useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { MATCH_STATUSES } from '../../utils/constants/statusConstants';

export const useTicketApplicationsSubscriptions = (
  isAuthenticated: boolean,
  userId: string | null,
  userType: string | null,
  fetchMyApplications: (isAuth: boolean, id: string | null) => Promise<void>
) => {
  useEffect(() => {
    if (!isAuthenticated || !userId || userType !== 'developer') {
      return;
    }

    console.log('[Subscriptions] Setting up developer application status changes subscription');

    // Subscribe to changes in the developer's application statuses
    const channel = supabase
      .channel(`dev-applications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'help_request_matches',
          filter: `developer_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('[Subscriptions] Developer application updated:', payload);
          
          const newStatus = payload.new?.status;
          
          if (newStatus === MATCH_STATUSES.APPROVED_BY_CLIENT) {
            toast.success('Your application has been approved!');
          } else if (newStatus === MATCH_STATUSES.REJECTED_BY_CLIENT) {
            toast.error('Your application has been rejected.');
          }
          
          // Refresh the applications list to get the latest status
          await fetchMyApplications(isAuthenticated, userId);
        }
      )
      .subscribe();

    return () => {
      console.log('[Subscriptions] Cleaning up developer application subscription');
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, userId, userType, fetchMyApplications]);
};
