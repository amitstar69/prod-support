
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { submitDeveloperApplication } from '../../integrations/supabase/helpRequests';

export interface UseTicketApplicationsResult {
  myApplications: HelpRequest[];
  checkIfApplied: (ticketId: string) => boolean;
  fetchMyApplications: () => Promise<void>;
}

export const useTicketApplications = (userId: string | null) => {
  const [myApplications, setMyApplications] = useState<HelpRequest[]>([]);
  
  // Function to check if a developer has already applied to a ticket
  const checkIfApplied = (ticketId: string): boolean => {
    if (!userId || !myApplications.length) return false;
    return myApplications.some(app => app.id === ticketId);
  };
  
  // Function to fetch developer's submitted applications
  // This function uses the userId from closure instead of requiring it as a parameter
  const fetchMyApplications = async () => {
    if (!userId) {
      setMyApplications([]);
      return;
    }

    try {
      // In a real implementation, we would fetch applications from the database
      // For local storage version, check for local applications
      const localApplications = JSON.parse(localStorage.getItem('help_request_matches') || '[]');
      const myApps = localApplications.filter((app: any) => app.developer_id === userId);
      
      if (myApps.length) {
        // Get the corresponding tickets for these applications
        const localTickets = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        const ticketsWithMyApps = localTickets.filter((ticket: HelpRequest) => 
          myApps.some((app: any) => app.request_id === ticket.id)
        );
        
        setMyApplications(ticketsWithMyApps);
      } else {
        setMyApplications([]);
      }
    } catch (error) {
      console.error('Error fetching my applications:', error);
      setMyApplications([]);
    }
  };

  return {
    myApplications,
    checkIfApplied,
    fetchMyApplications
  };
};
