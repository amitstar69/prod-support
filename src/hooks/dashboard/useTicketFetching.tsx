
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { HelpRequest } from '../../types/helpRequest';
import { getAllPublicHelpRequests, testDatabaseAccess } from '../../integrations/supabase/helpRequests';
import { sampleTickets } from './sampleData';
import { isApiSuccess, isApiError } from '../../types/api';

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
      
      if (!isAuthenticated) {
        console.log('[Ticket Fetching] Using sample tickets for unauthenticated user');
        setTickets(sampleTickets);
        setDataSource('sample');
        return;
      }

      const response = await getAllPublicHelpRequests(isAuthenticated);
      
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
      toast.error('An unexpected error occurred');
    } finally {
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
