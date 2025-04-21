
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { VALID_MATCH_STATUSES } from '../../integrations/supabase/helpRequestsApplications';
import { setupApplicationsSubscription } from '../../integrations/supabase/realtime';

export const useTicketApplicationsSubscriptions = (
  isAuthenticated: boolean,
  userId: string | null,
  userType: string | null,
  fetchMyApplications: (isAuthenticated: boolean, userId: string | null) => void
) => {
  // Store the subscription cleanup function
  const cleanupRef = useRef<(() => void) | null>(null);
  
  // Track if we've already shown errors
  const hasShownError = useRef(false);
  
  // Set up a generic subscription for the developer's applications
  useEffect(() => {
    if (!isAuthenticated || !userId || userType !== 'developer') {
      return;
    }
    
    console.log('[Subscriptions] Setting up global application subscription for developer:', userId);
    
    try {
      // Set up subscription for all applications related to this developer
      const cleanup = setupApplicationsSubscription(userId, (payload) => {
        if (payload.new && payload.new.developer_id === userId) {
          if (payload.new.status === VALID_MATCH_STATUSES.APPROVED) {
            toast.success('Your application has been approved!', {
              description: `Your application has been approved.`,
              action: {
                label: 'View Details',
                onClick: () => {
                  // Use the request_id from the payload to navigate
                  const ticketId = payload.new.request_id;
                  window.dispatchEvent(new CustomEvent('viewMyApplication', {
                    detail: { ticketId }
                  }));
                }
              }
            });
            // Use a timeout to prevent state updates during render
            setTimeout(() => {
              fetchMyApplications(isAuthenticated, userId);
            }, 300); // Increased from 100ms to 300ms for stability
          } else if (payload.new.status === VALID_MATCH_STATUSES.REJECTED) {
            toast('Your application has been rejected', {
              description: `Your application was not accepted.`
            });
          }
        }
      });
      
      // Store the cleanup function
      cleanupRef.current = cleanup;
      hasShownError.current = false;
      
      return () => {
        if (cleanupRef.current) {
          console.log('[Subscriptions] Cleaning up application subscription');
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };
    } catch (error) {
      console.error('[Subscriptions] Error setting up application subscription:', error);
      
      // Only show the error toast once per mount to avoid spamming the user
      if (!hasShownError.current) {
        toast.error('Unable to set up real-time updates for your applications');
        hasShownError.current = true;
      }
      
      return () => {}; // Return empty cleanup
    }
  }, [isAuthenticated, userId, userType, fetchMyApplications]);
};
