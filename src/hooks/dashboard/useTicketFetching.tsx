
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { HelpRequest } from '../../types/helpRequest';
import { getAllPublicHelpRequests } from '../../integrations/supabase/helpRequests';
import { sampleTickets } from './sampleData';
import { isApiSuccess } from '../../types/api';
import { setGlobalLoadingTimeout } from '../../utils/recovery';

export const useTicketFetching = (
  isAuthenticated: boolean, 
  userType: string | null
) => {
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>('sample');
  const navigate = useNavigate();

  const fetchTickets = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      // Set a global timeout to prevent the app from getting stuck
      const clearLoadingTimeout = setGlobalLoadingTimeout(() => {
        setIsLoading(false);
        toast.error('Failed to load tickets. Please try again.');
      }, 15000);
      
      if (!isAuthenticated) {
        console.log('[Ticket Fetching] Using sample tickets for unauthenticated user');
        setTickets(sampleTickets);
        setDataSource('sample');
        clearLoadingTimeout();
        setIsLoading(false);
        return;
      }

      // Add a controller to handle timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('[Ticket Fetching] Request timed out');
      }, 10000);

      const response = await getAllPublicHelpRequests(isAuthenticated);
      clearTimeout(timeoutId);
      
      if (isApiSuccess(response)) {
        console.log('[Ticket Fetching] All fetched tickets:', response.data.length);
        
        // Filter active tickets
        const filteredTickets = response.data.filter(ticket => 
          ['open', 'in-progress', 'claimed', 'pending', 'matching', 'developer-qa', 'client-review', 'client-approved', 'scheduled'].includes(ticket.status || '')
        );
        
        console.log('[Ticket Fetching] Filtered tickets:', filteredTickets.length);
        
        setTickets(filteredTickets);
        setDataSource(response.storageMethod || 'database');
      } else {
        console.error('[Ticket Fetching] Error fetching tickets:', response.error);
        setTickets([]);
        toast.error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('[Ticket Fetching] Exception:', error);
      setTickets([]);
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Request timed out. Please check your connection');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      clearLoadingTimeout?.();
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleForceRefresh = () => {
    toast.info('Refreshing tickets...');
    fetchTickets(true);
  };

  return {
    tickets,
    isLoading,
    dataSource,
    fetchTickets,
    handleForceRefresh,
  };
};
