
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { HelpRequest } from '../../types/helpRequest';
import { getAllPublicHelpRequests } from '../../integrations/supabase/helpRequests';
import { sampleTickets } from './sampleData';

export interface UseTicketFetchingResult {
  tickets: HelpRequest[];
  isLoading: boolean;
  dataSource: string;
  fetchTickets: (showLoading?: boolean) => Promise<void>;
  handleForceRefresh: () => void;
}

export const useTicketFetching = (
  isAuthenticated: boolean, 
  userType: string | null
): UseTicketFetchingResult => {
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>('sample');
  const navigate = useNavigate();

  // Effect for client users
  const checkUserType = () => {
    if (isAuthenticated && userType === 'client') {
      toast('You are logged in as a client. Redirecting to client dashboard.');
      navigate('/client-dashboard');
      return true;
    }
    return false;
  };

  const fetchTickets = async (showLoading = true) => {
    if (checkUserType()) return;
    
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      // For non-authenticated users, show sample tickets
      if (!isAuthenticated) {
        console.log('User not authenticated, showing sample tickets');
        setTickets(sampleTickets);
        setDataSource('sample');
        if (showLoading) {
          toast.info('Showing sample help requests. Sign in to see real tickets.', {
            duration: 5000
          });
        }
      } else {
        // For authenticated users, fetch real tickets from the database
        console.log('User authenticated, fetching real tickets');
        const response = await getAllPublicHelpRequests(isAuthenticated);
        
        if (response.success && response.data) {
          console.log('Successfully fetched tickets:', response.data.length);
          setTickets(response.data);
          setDataSource('database');
          
          // If no tickets were found
          if (response.data.length === 0 && showLoading) {
            toast.info('No active help requests found. Check back later.', {
              duration: 5000
            });
          }
        } else {
          console.error('Error fetching tickets:', response.error);
          console.log('No database tickets found or fetch failed');
          setTickets([]);
          
          if (showLoading && response.error) {
            toast.error(`Error loading tickets: ${response.error}`, {
              duration: 5000
            });
          }
        }
      }
    } catch (error) {
      console.error('Exception fetching tickets:', error);
      
      if (showLoading) {
        toast.error('Error loading tickets. Please try again later.');
        setTickets([]);
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleForceRefresh = () => {
    toast.success('Refreshing data...');
    fetchTickets();
  };

  return {
    tickets,
    isLoading,
    dataSource,
    fetchTickets,
    handleForceRefresh
  };
};
