
import { useEffect, useRef } from 'react';
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
  // Use a ref to store ticket IDs to prevent re-subscriptions
  const ticketIdsRef = useRef<string[]>([]);
  
  useEffect(() => {
    if (!isAuthenticated || !userId || userType !== 'developer') return;
    
    // Extract ticket IDs from recommended tickets
    const newTicketIds = recommendedTickets
      .filter(ticket => ticket.id)
      .map(ticket => ticket.id as string);
    
    // Compare with previous IDs to avoid unnecessary re-subscribing
    const ticketsChanged = 
      ticketIdsRef.current.length !== newTicketIds.length || 
      !ticketIdsRef.current.every(id => newTicketIds.includes(id));
    
    // Only set up subscriptions if tickets have changed
    if (ticketsChanged && newTicketIds.length > 0) {
      ticketIdsRef.current = newTicketIds;
      
      // Set up subscriptions for all ticket IDs
      const subscriptions = newTicketIds.map(ticketId => {
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
    }
  }, [recommendedTickets, isAuthenticated, userId, userType, fetchMyApplications]);
};
