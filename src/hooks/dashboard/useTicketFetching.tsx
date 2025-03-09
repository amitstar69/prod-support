import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { HelpRequest } from '../../types/helpRequest';
import { 
  getAllPublicHelpRequests, 
  testDatabaseAccess 
} from '../../integrations/supabase/helpRequests';
import { sampleTickets } from './sampleData';

export interface UseTicketFetchingResult {
  tickets: HelpRequest[];
  isLoading: boolean;
  errorMessage: string | null;
  dataSource: string;
  fetchTickets: (showLoading?: boolean) => Promise<{success: boolean, data: HelpRequest[], source: string, error?: string}>;
  recommendTickets: (tickets: HelpRequest[], userId: string | null) => HelpRequest[];
  handleForceRefresh: () => void;
  runDatabaseTest: () => Promise<void>;
}

export const useTicketFetching = (
  isAuthenticated: boolean, 
  userId: string | null
): UseTicketFetchingResult => {
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('sample');
  const navigate = useNavigate();

  // Effect for client users
  const checkUserType = () => {
    // Logic for user type checking can be implemented here
    return false;
  };

  const fetchTickets = async (showLoading = true) => {
    if (checkUserType()) return { success: false, data: [], source: '', error: 'Wrong user type' };
    
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      // For non-authenticated users, show sample tickets
      if (!isAuthenticated) {
        console.log('[useTicketFetching] User not authenticated, showing sample tickets');
        setTickets(sampleTickets);
        setDataSource('sample');
        if (showLoading) {
          toast.info('Showing sample help requests. Sign in to see real tickets.', {
            duration: 5000
          });
        }
        setErrorMessage(null);
        return { success: true, data: sampleTickets, source: 'sample' };
      } else {
        // For authenticated users, fetch real tickets from the database
        console.log('[useTicketFetching] User authenticated, fetching real tickets');
        const response = await getAllPublicHelpRequests(isAuthenticated);
        
        if (response.success && response.data) {
          console.log('[useTicketFetching] Successfully fetched tickets:', response.data.length);
          
          // Log each ticket for debugging
          response.data.forEach((ticket, index) => {
            console.log(`[useTicketFetching] Ticket ${index+1}:`, {
              id: ticket.id,
              status: ticket.status,
              title: ticket.title,
              client_id: ticket.client_id
            });
          });
          
          setTickets(response.data);
          setDataSource('database');
          setErrorMessage(null);
          
          // If no tickets were found
          if (response.data.length === 0 && showLoading) {
            toast.info('No active help requests found. Database returned 0 records.', {
              duration: 5000
            });
          }
          
          return { success: true, data: response.data, source: 'database' };
        } else {
          console.error('[useTicketFetching] Error fetching tickets:', response.error);
          
          if (showLoading && response.error) {
            toast.error(`Error loading tickets: ${response.error}`, {
              duration: 5000
            });
          }
          
          setErrorMessage(response.error || 'Failed to fetch tickets');
          
          // Keep the existing tickets state if there was an error
          // This prevents flickering of the UI
          if (tickets.length === 0) {
            console.log('[useTicketFetching] No tickets found in state, setting empty array');
            setTickets([]);
          }
          
          return { success: false, data: tickets, source: 'error', error: response.error };
        }
      }
    } catch (error) {
      console.error('[useTicketFetching] Exception fetching tickets:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(errorMsg);
      
      if (showLoading) {
        toast.error('Error loading tickets. Please try again later.');
      }
      
      return { success: false, data: tickets, source: 'error', error: errorMsg };
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };
  
  // Function to recommend tickets based on user profile
  const recommendTickets = (ticketsToFilter: HelpRequest[], currentUserId: string | null): HelpRequest[] => {
    if (!currentUserId) return [];
    
    // This is a placeholder implementation
    // In a real app, we would use a more sophisticated algorithm that matches
    // the developer's skills with ticket requirements
    return ticketsToFilter.filter(ticket => 
      ticket.status === 'pending' || ticket.status === 'matching'
    );
  };

  const runDatabaseTest = async () => {
    if (!isAuthenticated) {
      toast.info('You need to be logged in to run database tests');
      return;
    }
    
    toast.loading('Testing database connectivity...');
    const result = await testDatabaseAccess();
    toast.dismiss();
    
    if (result.success) {
      toast.success(`Database test successful! Found ${result.count} tickets.`);
      console.log('[useTicketFetching] Database test result:', result);
      
      // After successful test, try to fetch tickets again
      fetchTickets();
    } else {
      toast.error('Database test failed. See console for details.');
      console.error('[useTicketFetching] Database test error:', result);
    }
  };

  const handleForceRefresh = () => {
    toast.success('Refreshing data...');
    fetchTickets();
  };

  return {
    tickets,
    isLoading,
    errorMessage,
    dataSource,
    fetchTickets,
    recommendTickets,
    handleForceRefresh,
    runDatabaseTest
  };
};
