
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { HelpRequest } from '../../types/helpRequest';
import { getAllPublicHelpRequests } from '../../integrations/supabase/helpRequests';
import { sampleTickets } from './sampleData';
import { isApiSuccess } from '../../types/api';
import { setGlobalLoadingTimeout } from '../../utils/recovery';
import { HELP_REQUEST_STATUSES } from '../../utils/constants/statusConstants';

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

  // Define a comprehensive list of statuses to include in filter
  const activeStatuses = [
    HELP_REQUEST_STATUSES.OPEN,
    HELP_REQUEST_STATUSES.SUBMITTED,
    HELP_REQUEST_STATUSES.PENDING_MATCH,
    'matching',
    HELP_REQUEST_STATUSES.DEV_REQUESTED,
    HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL
  ];

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

      // Add more detailed logging to diagnose the issue
      console.log('[Ticket Fetching] Authenticated user, fetching from database');

      const response = await getAllPublicHelpRequests(isAuthenticated);
      console.log('[Ticket Fetching] Response received:', response);
      
      if (isApiSuccess(response)) {
        console.log('[Ticket Fetching] All fetched tickets:', response.data.length);
        
        // Include a comprehensive list of relevant statuses
        // This is intentionally broad to catch all active, pending, or in-progress tickets
        const filteredTickets = response.data.filter(ticket => {
          const status = (ticket.status || '').toLowerCase();
          
          // For client users, include all their tickets
          if (userType === 'client' && ticket.client_id) {
            return true;
          }
          
          // For developer users, only show tickets that are open or related to the developer
          return activeStatuses.includes(status) ||
                 status.includes('open') ||
                 status.includes('pending') ||
                 status.includes('progress') ||
                 status.includes('review') ||
                 status.includes('qa') ||
                 status.includes('need') ||
                 status.includes('ready');
        });
        
        console.log('[Ticket Fetching] Filtered tickets:', filteredTickets.length, 'with statuses:', 
          filteredTickets.map(t => t.status));
        
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
  }, [isAuthenticated, lastFetchAttempt, userType, activeStatuses]);

  // Initial fetch on mount
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
