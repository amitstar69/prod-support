import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { submitDeveloperApplication } from '../../integrations/supabase/helpRequests';

export interface UseTicketApplicationsResult {
  recommendedTickets: HelpRequest[];
  myApplications: HelpRequest[];
  handleClaimTicket: (ticket: HelpRequest) => void;
  fetchMyApplications: () => Promise<void>;
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

  useEffect(() => {
    if (!tickets || !isAuthenticated || !userId) {
      setRecommendedTickets([]);
      return;
    }

    console.log('[useTicketApplications] Processing tickets for recommendations:', tickets.length);
    
    const recommended = tickets.filter(ticket => {
      const isAvailable = ticket.status === 'pending' || ticket.status === 'matching';
      return isAvailable;
    });
    
    console.log('[useTicketApplications] Recommended tickets after filtering:', recommended.length);
    setRecommendedTickets(recommended);
  }, [tickets, isAuthenticated, userId]);

// Update the handleClaimTicket function
const handleClaimTicket = async (ticket: HelpRequest) => {
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
    
    const ticketId = ticket.id;
    
    if (!ticketId) {
      toast.error('Invalid ticket ID');
      return;
    }
    
    const result = await submitDeveloperApplication(
      ticketId, 
      userId,
      {
        proposed_message: "I'd like to help with your request. I have experience in this area.",
        proposed_duration: 60, // 1 hour
        proposed_rate: 75 // $75/hour
      }
    );
    
    toast.dismiss();
    
    if (result.success) {
      toast.success('Application submitted successfully!');
      refreshTickets();
      fetchMyApplications();
    } else {
      toast.error(`Failed to submit application: ${result.error}`);
    }
  } catch (error) {
    toast.dismiss();
    toast.error('An error occurred while processing your application');
    console.error('Error claiming ticket:', error);
  }
};

  const fetchMyApplications = async () => {
    if (!isAuthenticated || !userId) {
      setMyApplications([]);
      return;
    }

    try {
      const applications = tickets.filter(ticket => 
        ticket.status === 'matching' || ticket.status === 'in-progress'
      );
      
      setMyApplications(applications);
    } catch (error) {
      console.error('Error fetching my applications:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchMyApplications();
    }
  }, [tickets, isAuthenticated, userId]);

  return {
    recommendedTickets,
    myApplications,
    handleClaimTicket,
    fetchMyApplications
  };
};
