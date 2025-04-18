
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { HelpRequest } from '../../types/helpRequest';
import { getAllPublicHelpRequests } from '../../integrations/supabase/helpRequests';
import { testDatabaseConnection } from '../../integrations/supabase/client'; // Fix import source
import { sampleTickets } from './sampleData';

export const useTicketFetching = (
  isAuthenticated: boolean, 
  userType: string | null
) => {
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>('sample');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTickets = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
        setFetchError(null);
      }
      
      // Safety check for authentication status
      if (!isAuthenticated) {
        console.log('[Ticket Fetching] Using sample tickets for unauthenticated user');
        setTickets(sampleTickets);
        setDataSource('sample');
        setIsLoading(false);
        return;
      }

      // Attempt to get tickets from database
      console.log('[Ticket Fetching] Attempting to fetch tickets from database...');
      
      // Run a quick connection test
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        console.warn('[Ticket Fetching] Database connection test failed, using fallback data');
        setTickets(sampleTickets);
        setDataSource('sample');
        setFetchError('Could not connect to database. Please check your connection or try again later.');
        setIsLoading(false);
        return;
      }
      
      // Get help requests from database
      const response = await getAllPublicHelpRequests(isAuthenticated, userType);
      
      if (response.success && 'data' in response) {
        console.log('[Ticket Fetching] All fetched tickets:', response.data.length);
        
        if (response.data.length > 0) {
          // Log ticket statuses for debugging
          const statusCounts = response.data.reduce((acc, ticket) => {
            acc[ticket.status || 'unknown'] = (acc[ticket.status || 'unknown'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          console.log('[Ticket Fetching] Ticket status breakdown:', statusCounts);
          
          setTickets(response.data);
          setDataSource('database');
          setFetchError(null);
        } else {
          console.log('[Ticket Fetching] No tickets returned from database');
          setTickets([]);
          setDataSource('database');
          setFetchError(null);
        }
      } else {
        console.error('[Ticket Fetching] Error fetching tickets:', response.error);
        setTickets([]);
        setDataSource('error');
        setFetchError(response.error || 'Failed to fetch help requests');
        toast.error('Error loading tickets. Please try again later.');
      }
    } catch (error) {
      console.error('[Ticket Fetching] Exception:', error);
      setTickets([]);
      setDataSource('error');
      setFetchError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error('Error loading tickets. Please try again later.');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, userType]);

  // Initial data fetch
  useEffect(() => {
    fetchTickets();
    
    // Set up automatic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchTickets(false);
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchTickets]);

  // Handle force refresh function
  const handleForceRefresh = () => {
    toast.info('Refreshing tickets...');
    fetchTickets(true);
  };

  return {
    tickets,
    isLoading,
    dataSource,
    fetchError,
    fetchTickets,
    handleForceRefresh,
  };
};
