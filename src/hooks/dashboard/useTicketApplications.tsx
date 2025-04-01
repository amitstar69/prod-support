import { useState, useEffect } from 'react';
import { HelpRequest, ApplicationStatus } from '../../types/helpRequest';
import { toast } from 'sonner';
import { 
  submitDeveloperApplication, 
  getDeveloperApplicationsForRequest, 
  VALID_MATCH_STATUSES 
} from '../../integrations/supabase/helpRequestsApplications';
import { setupApplicationsSubscription } from '../../integrations/supabase/realtime';

// Constants to prevent numeric overflow
const MAX_RATE = 9.99; // Maximum rate in USD (precision 3, scale 2)

// Valid status values exactly matching the database constraint
const VALID_STATUS_VALUES = VALID_MATCH_STATUSES;

export interface UseTicketApplicationsResult {
  recommendedTickets: HelpRequest[];
  myApplications: HelpRequest[];
  handleClaimTicket: (ticketId: string) => void;
  fetchMyApplications: (userId: string | null) => Promise<void>;
  checkApplicationStatus: (ticketId: string, userId: string) => Promise<string | null>;
}

export const useTicketApplications = (
  tickets: HelpRequest[],
  isAuthenticated: boolean,
  userId: string | null,
  userType: string | null,
  refreshTickets: () => void
): UseTicketApplicationsResult => {
  const [recommendedTickets, setRecommendedTickets] = useState<HelpRequest[]>([]);
  const [myApplications, setMyApplications] = useState<HelpRequest[]>([]);
  const [applicationStatuses, setApplicationStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!tickets || !isAuthenticated || !userId) {
      setRecommendedTickets([]);
      return;
    }

    console.log('[useTicketApplications] Processing tickets for recommendations:', tickets.length);
    
    const recommended = tickets.filter(ticket => {
      const isAvailable = ticket.status === 'open' || ticket.status === 'claimed';
      return isAvailable;
    });
    
    console.log('[useTicketApplications] Recommended tickets after filtering:', recommended.length);
    setRecommendedTickets(recommended);
  }, [tickets, isAuthenticated, userId]);

  const handleClaimTicket = async (ticketId: string) => {
    if (!isAuthenticated || !userId) {
      toast.error('You must be logged in to claim tickets');
      return;
    }

    if (userType !== 'developer') {
      toast.error('Only developers can claim tickets');
      return;
    }

    try {
      toast.loading('Processing your application...');
      
      const defaultRate = 5; // Default hourly rate within the numeric(3,2) limit
      const formattedRate = Math.min(Math.max(0, parseFloat(defaultRate.toFixed(2))), MAX_RATE);
      
      const defaultDuration = 60;
      
      const result = await submitDeveloperApplication(
        ticketId, 
        userId as string,
        {
          proposed_message: "I'd like to help with your request. I have experience in this area.",
          proposed_duration: defaultDuration,
          proposed_rate: formattedRate
        }
      );
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('Application submitted successfully!');
        
        refreshTickets();
        
        if (userId) {
          await fetchMyApplications(userId);
        }
      } else {
        toast.error(`Failed to submit application: ${result.error}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An error occurred while processing your application');
      console.error('Error claiming ticket:', error);
    }
  };

  const checkApplicationStatus = async (ticketId: string, developerId: string): Promise<string | null> => {
    try {
      const result = await getDeveloperApplicationsForRequest(ticketId);
      
      if (result.success && result.data) {
        const myApplication = result.data.find(app => app.developer_id === developerId);
        return myApplication ? myApplication.status : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking application status:', error);
      return null;
    }
  };

  const fetchMyApplications = async (currentUserId: string | null) => {
    if (!isAuthenticated || !currentUserId) {
      setMyApplications([]);
      return;
    }

    try {
      const applications = tickets.filter(ticket => 
        ticket.status === 'claimed' || ticket.status === 'in-progress'
      );
      
      setMyApplications(applications);
    } catch (error) {
      console.error('Error fetching my applications:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !userId || userType !== 'developer') return;
    
    const subscriptions = recommendedTickets.map(ticket => {
      if (!ticket.id) return null;
      
      return setupApplicationsSubscription(ticket.id, (payload) => {
        if (payload.new && payload.new.developer_id === userId) {
          setApplicationStatuses(prev => ({
            ...prev,
            [ticket.id || '']: payload.new.status
          }));
          
          // Make sure to use the exact constant values for status comparison
          if (payload.new.status === VALID_STATUS_VALUES.APPROVED) {
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
          } else if (payload.new.status === VALID_STATUS_VALUES.REJECTED) {
            toast('Your application has been rejected', {
              description: `Your application for "${ticket.title}" was not accepted.`
            });
          }
          
          fetchMyApplications(userId);
        }
      });
    }).filter(Boolean);
    
    return () => {
      subscriptions.forEach(cleanup => cleanup && cleanup());
    };
  }, [recommendedTickets, isAuthenticated, userId, userType]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchMyApplications(userId);
    }
  }, [tickets, isAuthenticated, userId]);

  return {
    recommendedTickets,
    myApplications,
    handleClaimTicket,
    fetchMyApplications,
    checkApplicationStatus
  };
};
