
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { submitDeveloperApplication } from '../../integrations/supabase/helpRequests';

// Constants to prevent numeric overflow
const MAX_RATE = 999.99; // Maximum rate in USD

export interface UseTicketApplicationsResult {
  recommendedTickets: HelpRequest[];
  myApplications: HelpRequest[];
  handleClaimTicket: (ticketId: string) => void;
  fetchMyApplications: (userId: string | null) => Promise<void>;
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

  // Initial processing of tickets
  useEffect(() => {
    if (!tickets || !isAuthenticated || !userId) {
      setRecommendedTickets([]);
      return;
    }

    console.log('[useTicketApplications] Processing tickets for recommendations:', tickets.length);
    
    // For developers, show all available tickets as recommended
    // Only show open or claimed tickets as recommended
    const recommended = tickets.filter(ticket => {
      const isAvailable = ticket.status === 'open' || ticket.status === 'claimed';
      return isAvailable;
    });
    
    console.log('[useTicketApplications] Recommended tickets after filtering:', recommended.length);
    setRecommendedTickets(recommended);
  }, [tickets, isAuthenticated, userId]);

  // Function to handle claiming a ticket
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
      
      // Make sure the rate is properly formatted for the database
      // Cap at MAX_RATE to prevent overflow
      const defaultRate = 75; // Default hourly rate
      const formattedRate = Math.min(Math.max(0, parseFloat(defaultRate.toFixed(2))), MAX_RATE);
      
      // Use a standard 1-hour duration (60 minutes)
      const defaultDuration = 60;
      
      // Submit application with controlled values
      const result = await submitDeveloperApplication(
        ticketId, 
        userId,
        {
          proposed_message: "I'd like to help with your request. I have experience in this area.",
          proposed_duration: defaultDuration,
          proposed_rate: formattedRate
        }
      );
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('Application submitted successfully!');
        
        // Refresh ticket list
        refreshTickets();
        
        // Also refresh my applications
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

  // Function to fetch developer's submitted applications
  const fetchMyApplications = async (currentUserId: string | null) => {
    if (!isAuthenticated || !currentUserId) {
      setMyApplications([]);
      return;
    }

    try {
      // In a real implementation, we would fetch applications from the database
      // For now, use the tickets data and filter based on some criteria
      
      // This is a placeholder. In a real app, you would fetch actual applications
      // from the database that match the current user ID
      const applications = tickets.filter(ticket => 
        // Example filtering logic - in real app this would check a "developer_id" field
        ticket.status === 'claimed' || ticket.status === 'in-progress'
      );
      
      setMyApplications(applications);
    } catch (error) {
      console.error('Error fetching my applications:', error);
    }
  };

  // Fetch my applications when tickets change
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchMyApplications(userId);
    }
  }, [tickets, isAuthenticated, userId]);

  return {
    recommendedTickets,
    myApplications,
    handleClaimTicket,
    fetchMyApplications
  };
};
