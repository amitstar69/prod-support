
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
  fetchMyApplications: (isAuthenticated: boolean, userId: string | null) => void
) => {
  useEffect(() => {
    if (!isAuthenticated || !userId || userType !== 'developer') return;
    
    const ticketIds = recommendedTickets
      .filter(ticket => ticket.id)
      .map(ticket => ticket.id as string);
      
    if (ticketIds.length === 0) return;
    
    // Create a stable reference to the tickets to prevent re-subscriptions
    const subscriptions = ticketIds.map(ticketId => {
      return setupApplicationsSubscription(ticketId, (payload) => {
        if (payload.new && payload.new.developer_id === userId) {
          if (payload.new.status === VALID_MATCH_STATUSES.APPROVED) {
            toast.success('Your application has been approved!', {
              description: `Your application has been approved.`,
              action: {
                label: 'View Details',
                onClick: () => {
                  window.dispatchEvent(new CustomEvent('viewMyApplication', {
                    detail: { ticketId }
                  }));
                }
              }
            });
            // Use a timeout to prevent state updates during render
            setTimeout(() => {
              fetchMyApplications(isAuthenticated, userId);
            }, 0);
          } else if (payload.new.status === VALID_MATCH_STATUSES.REJECTED) {
            toast('Your application has been rejected', {
              description: `Your application was not accepted.`
            });
          }
        }
      });
    }).filter(Boolean);
    
    return () => {
      subscriptions.forEach(cleanup => cleanup && cleanup());
    };
  }, [recommendedTickets.length, isAuthenticated, userId, userType]); // Use recommendedTickets.length instead of the full array
};
