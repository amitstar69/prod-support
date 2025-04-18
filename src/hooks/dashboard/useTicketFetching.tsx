
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
        setTickets(sampleTickets);
        setDataSource('sample');
        return;
      }

      const response = await getAllPublicHelpRequests(isAuthenticated);
      
      if (response.success && response.data) {
        // Add verbose logging to understand ticket sources
        console.log('[Ticket Fetching] All fetched tickets:', response.data);
        
        // Log ticket statuses for debugging
        const statusCounts = response.data.reduce((acc, ticket) => {
          acc[ticket.status || 'unknown'] = (acc[ticket.status || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('[Ticket Fetching] Ticket status breakdown:', statusCounts);
        
        // Add additional filter to ensure only relevant tickets are shown
        const filteredTickets = response.data.filter(ticket => 
          ['open', 'in-progress', 'claimed', 'pending', 'matching'].includes(ticket.status || '')
        );
        
        console.log('[Ticket Fetching] Filtered tickets:', filteredTickets);
        
        setTickets(filteredTickets);
        setDataSource('database');
      } else {
        console.error('[Ticket Fetching] Error fetching tickets:', response.error);
        setTickets([]);
      }
    } catch (error) {
      console.error('[Ticket Fetching] Exception:', error);
      setTickets([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  // Add the missing handleForceRefresh function
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

