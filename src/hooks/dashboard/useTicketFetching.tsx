
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { HelpRequest } from '../../types/helpRequest';
import { 
  getAllPublicHelpRequests, 
  testDatabaseAccess 
} from '../../integrations/supabase/helpRequests';
import { sampleTickets } from './sampleData';

export const useTicketFetching = (
  isAuthenticated: boolean, 
  userId: string | null
) => {
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('sample');
  const navigate = useNavigate();

  const fetchTickets = async (showLoading = true) => {
    console.log('[useTicketFetching] Starting fetch, auth status:', { isAuthenticated, userId });
    
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      if (!isAuthenticated) {
        console.log('[useTicketFetching] Using sample data for non-authenticated user');
        setTickets(sampleTickets);
        setDataSource('sample');
        if (showLoading) {
          toast.info('Showing sample help requests. Sign in to see real tickets.', {
            duration: 5000
          });
        }
        setErrorMessage(null);
        return { success: true, data: sampleTickets, source: 'sample' };
      }
      
      console.log('[useTicketFetching] Fetching real tickets from database');
      const response = await getAllPublicHelpRequests(isAuthenticated);
      
      console.log('[useTicketFetching] Database response:', response);
      
      if (response.success && response.data) {
        setTickets(response.data);
        setDataSource('database');
        setErrorMessage(null);
        return { success: true, data: response.data, source: 'database' };
      }
      
      console.error('[useTicketFetching] Error in response:', response.error);
      setErrorMessage(response.error || 'Failed to fetch tickets');
      
      if (tickets.length === 0) {
        setTickets([]);
      }
      
      return { success: false, data: tickets, source: 'error', error: response.error };
      
    } catch (error) {
      console.error('[useTicketFetching] Exception:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      return { success: false, data: tickets, source: 'error', error: String(error) };
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const recommendTickets = (ticketsToFilter: HelpRequest[], currentUserId: string | null): HelpRequest[] => {
    if (!currentUserId || !Array.isArray(ticketsToFilter)) return [];
    
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
