
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { HelpRequest } from '../../types/helpRequest';
import { useTicketFetching } from './useTicketFetching';
import { useTicketFilters } from './useTicketFilters';
import { useTicketApplicationActions } from './useTicketApplicationActions';
import { supabase } from '../../integrations/supabase/client';

export const useDeveloperDashboard = () => {
  const { userId, isAuthenticated, userType } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    tickets, 
    isLoading, 
    hasError, 
    dataSource,
    fetchTickets,
    handleForceRefresh 
  } = useTicketFetching(isAuthenticated, userType);
  
  const { 
    filters, 
    categorizedTickets,
    handleFilterChange, 
    resetFilters 
  } = useTicketFilters(tickets);
  
  // Create a dummy function to satisfy the type if needed
  const dummyFetchMyApplications = async () => {
    return Promise.resolve();
  };
  
  const { handleClaimTicket } = useTicketApplicationActions(
    isAuthenticated,
    userId,
    userType,
    handleForceRefresh,
    dummyFetchMyApplications
  );

  // Set up real-time listener for ticket updates
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    
    const channel = supabase
      .channel('dashboard-tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests'
        },
        () => {
          console.log('[DeveloperDashboard] Ticket data changed, refreshing');
          fetchTickets(false); // Refresh without showing loading state
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, userId, fetchTickets]);

  // Set up real-time listener for application updates if user is a client
  useEffect(() => {
    if (!isAuthenticated || !userId || userType !== 'client') return;
    
    const channel = supabase
      .channel('dashboard-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_request_matches'
        },
        () => {
          console.log('[DeveloperDashboard] Application data changed, refreshing tickets');
          fetchTickets(false); // Refresh without showing loading state
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, userId, userType, fetchTickets]);

  return {
    tickets,
    categorizedTickets,
    filters,
    isLoading,
    hasError,
    dataSource,
    showFilters,
    setShowFilters,
    handleFilterChange,
    resetFilters,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets
  };
};

// Export default for backward compatibility
export default useDeveloperDashboard;
