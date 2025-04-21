
import { useEffect } from 'react';
import { toast } from 'sonner';
import { VALID_MATCH_STATUSES } from '../../integrations/supabase/helpRequestsApplications';
import { setupApplicationsSubscription } from '../../integrations/supabase/realtime';
import { HelpRequest } from '../../types/helpRequest';

export const useTicketApplicationsSubscriptions = (
  recommendedTickets: HelpRequest[],
  isAuthenticated: boolean,
  userId: string | null,
  userType: string | null,
  fetchMyApplications: (userId: string | null) => void
) => {
  useEffect(() => {
    if (!isAuthenticated || !userId || userType !== 'developer') return;
    const subscriptions = recommendedTickets.map(ticket => {
      if (!ticket.id) return null;
      return setupApplicationsSubscription(ticket.id, (payload) => {
        if (payload.new && payload.new.developer_id === userId) {
          if (payload.new.status === VALID_MATCH_STATUSES.APPROVED) {
            toast.success('Your application has been approved!', {
              description: `Your application for "${ticket.title}" has been approved.`,
              action: {
                label: 'View Details',
                onClick: () => {
                  window.dispatchEvent(new CustomEvent('viewMyApplication', {
                    detail: { ticketId: ticket.id }
                  }));
                }
              }
            });
            fetchMyApplications(userId);
          } else if (payload.new.status === VALID_MATCH_STATUSES.REJECTED) {
            toast('Your application has been rejected', {
              description: `Your application for "${ticket.title}" was not accepted.`
            });
          }
        }
      });
    }).filter(Boolean);
    return () => {
      subscriptions.forEach(cleanup => cleanup && cleanup());
    };
  }, [recommendedTickets, isAuthenticated, userId, userType, fetchMyApplications]);
};
