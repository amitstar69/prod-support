
import { useState, useCallback } from 'react';
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
  const [hasError, setHasError] = useState(false);
  const [lastFetchAttempt, setLastFetchAttempt] = useState(0);
  const navigate = useNavigate();

  const fetchTickets = useCallback(async (showLoading = true) => {
    // Prevent multiple rapid fetch attempts (throttle to max once per 3 seconds)
    const now = Date.now();
    if (now - lastFetchAttempt < 3000) {
      console.log('[Ticket Fetching] Throttling fetch request, too soon after last attempt');
      return;
    }
    
    setLastFetchAttempt(now);
    let clearTimeoutFn: (() => void) | null = null;
    
    try {
      if (showLoading) {
        setIsLoading(true);
        setHasError(false);
      }
      
      // Set a shorter global timeout to prevent the app from getting stuck
      clearTimeoutFn = setGlobalLoadingTimeout(() => {
        setIsLoading(false);
        setHasError(true);
        toast.error('Failed to load tickets. Please try again.');
      }, 10000); // Reduced from 15s to 10s
      
      if (!isAuthenticated) {
        console.log('[Ticket Fetching] Using sample tickets for unauthenticated user');
        setTickets(sampleTickets);
        setDataSource('sample');
        setIsLoading(false);
        return;
      }

      // Add a controller to handle timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('[Ticket Fetching] Request timed out');
      }, 8000); // Reduced from 10s to 8s

      const response = await getAllPublicHelpRequests();
      
      // Clear timeout if the request completes successfully
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
        setHasError(false);
      } else {
        console.error('[Ticket Fetching] Error fetching tickets:', response.error);
        setTickets([]);
        setHasError(true);
        toast.error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('[Ticket Fetching] Exception:', error);
      setTickets([]);
      setHasError(true);
      
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Request timed out. Please check your connection');
      } else {
        toast.error('An unexpected error occurred');
      }
      
      // Fallback to sample data when fetch fails
      console.log('[Ticket Fetching] Using sample tickets as fallback after error');
      setTickets(sampleTickets);
      setDataSource('sample (fallback)');
    } finally {
      // Ensure we clear any timeout we created
      if (clearTimeoutFn) {
        clearTimeoutFn();
      }
      
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, lastFetchAttempt]);

  const handleForceRefresh = useCallback(() => {
    toast.info('Refreshing tickets...');
    fetchTickets(true);
  }, [fetchTickets]);

  return {
    tickets,
    isLoading,
    hasError,
    dataSource,
    fetchTickets,
    handleForceRefresh,
  };
};
