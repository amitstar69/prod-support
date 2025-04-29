
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
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
        
        // Only set error if we've tried a few times
        if (retryCount >= maxRetries) {
          setHasError(true);
          toast.error('Failed to load tickets after multiple attempts.');
        } else {
          // Auto-retry
          setRetryCount(prev => prev + 1);
          fetchTickets(true);
        }
      }, 10000); // 10 second timeout
      
      if (!isAuthenticated) {
        console.log('[Ticket Fetching] Using sample tickets for unauthenticated user');
        setTickets(sampleTickets);
        setDataSource('sample');
        setIsLoading(false);
        return;
      }

      // Add more detailed logging to diagnose the issue
      console.log('[Ticket Fetching] Authenticated user, fetching from database');

      // Simplified version - only fetch essential fields for better performance
      const response = await getAllPublicHelpRequests(
        isAuthenticated, 
        'id,title,description,status,client_id,created_at,technical_area,urgency,budget_range'
      );
      
      console.log('[Ticket Fetching] Response received:', response);
      
      if (isApiSuccess(response)) {
        console.log('[Ticket Fetching] All fetched tickets:', response.data.length);
        
        // Reset retry count on success
        setRetryCount(0);
        
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
        
        // Only set error if we've tried a few times
        if (retryCount >= maxRetries) {
          setTickets([]);
          setHasError(true);
          toast.error('Failed to fetch tickets after multiple attempts');
        } else {
          // Auto-retry on error
          setRetryCount(prev => prev + 1);
          console.log(`[Ticket Fetching] Retry ${retryCount + 1}/${maxRetries}`);
          
          // Use sample data for first retry to ensure UI can continue
          if (retryCount === 0) {
            setTickets(sampleTickets);
            setDataSource('sample (temporary)');
          }
          
          // Schedule retry
          setTimeout(() => fetchTickets(false), 2000);
        }
      }
    } catch (error) {
      console.error('[Ticket Fetching] Exception:', error);
      
      // Only set error if we've tried a few times
      if (retryCount >= maxRetries) {
        setTickets([]);
        setHasError(true);
        
        if (error instanceof Error && error.name === 'AbortError') {
          toast.error('Request timed out. Please check your connection');
        } else {
          toast.error('An unexpected error occurred after multiple attempts');
        }
        
        // Fallback to sample data when fetch fails after retries
        console.log('[Ticket Fetching] Using sample tickets as fallback after error');
        setTickets(sampleTickets);
        setDataSource('sample (fallback)');
      } else {
        // Auto-retry on error
        setRetryCount(prev => prev + 1);
        console.log(`[Ticket Fetching] Retry ${retryCount + 1}/${maxRetries} after error`);
        setTimeout(() => fetchTickets(retryCount > 0), 2000);
      }
    } finally {
      // Ensure we clear any timeout we created
      if (clearTimeoutFn) {
        clearTimeoutFn();
      }
      
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, lastFetchAttempt, userType, activeStatuses, retryCount, maxRetries]);

  // Initial fetch on mount
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleForceRefresh = useCallback(() => {
    setRetryCount(0); // Reset retry count on manual refresh
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
