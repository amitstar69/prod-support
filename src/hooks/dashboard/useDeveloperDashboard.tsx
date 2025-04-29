
// Refactored: Root hook delegates to focused hooks for logic
import { useState, useEffect, useCallback, useRef } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { useRecommendedTickets } from './useRecommendedTickets';
import { useMyTicketApplications } from './useMyTicketApplications';
import { useTicketApplicationActions } from './useTicketApplicationActions';
import { useTicketApplicationsSubscriptions } from './useTicketApplicationsSubscriptions';
import { useTicketFetching } from './useTicketFetching';
import { useTicketFilters } from './useTicketFilters';
import { toast } from 'sonner';

// Keep types matching the old interface for compatibility
export interface UseTicketApplicationsResult {
  recommendedTickets: HelpRequest[];
  myApplications: HelpRequest[];
  isLoadingApplications: boolean;
  hasError: boolean;
  handleClaimTicket: (ticketId: string) => void;
  fetchMyApplications: (isAuthenticated: boolean, userId: string | null) => Promise<void>;
  checkApplicationStatus: (ticketId: string, userId: string) => Promise<string | null>;
  dataSource: string;
}

export const useTicketApplications = (
  tickets: HelpRequest[],
  isAuthenticated: boolean,
  userId: string | null,
  userType: string | null,
  refreshTickets: () => void
): UseTicketApplicationsResult => {
  const recommendedTicketsResult = useRecommendedTickets(tickets, isAuthenticated, userId);
  const { 
    myApplications, 
    fetchMyApplications, 
    isLoading: isLoadingApplications, 
    hasError,
    dataSource: applicationsDataSource 
  } = useMyTicketApplications();
  
  const { handleClaimTicket, checkApplicationStatus } = useTicketApplicationActions(
    isAuthenticated, userId, userType, refreshTickets, fetchMyApplications
  );
  
  // Flag to track if we've already made an initial fetch
  const hasInitiallyFetched = useRef(false);

  // Memoize the function call to prevent unnecessary re-renders
  const fetchApplicationsIfAuthenticated = useCallback(() => {
    if (isAuthenticated && userId && !hasInitiallyFetched.current) {
      console.log('[Applications] Auto-fetching applications for user', userId);
      fetchMyApplications(isAuthenticated, userId).catch(error => {
        console.error('[Applications] Error in initial fetch:', error);
        toast.error('Failed to load your applications');
      });
      hasInitiallyFetched.current = true;
    }
  }, [isAuthenticated, userId, fetchMyApplications]);
  
  // Refreshed list of applications when user changes or is authenticated
  useEffect(() => {
    fetchApplicationsIfAuthenticated();
    
    // Reset the flag when user changes
    return () => {
      hasInitiallyFetched.current = false;
    };
  }, [fetchApplicationsIfAuthenticated]);

  // Real-time subscription for application status change notifications
  useTicketApplicationsSubscriptions(
    isAuthenticated,
    userId,
    userType,
    (isAuth, id) => fetchMyApplications(isAuth, id)
  );

  return {
    recommendedTickets: recommendedTicketsResult || [],
    myApplications: myApplications || [],
    isLoadingApplications,
    hasError,
    handleClaimTicket,
    fetchMyApplications,
    checkApplicationStatus,
    // Use the dataSource from applications hook for consistency
    dataSource: applicationsDataSource
  };
};

// This is the main hook that DeveloperDashboard uses
export const useDeveloperDashboard = () => {
  const {
    tickets,
    isLoading,
    dataSource,
    hasError,
    fetchTickets
  } = useTicketFetching();

  const { filters, handleFilterChange } = useTicketFilters();
  const [showFilters, setShowFilters] = useState(false);

  // Filter tickets based on current filter options
  const filteredTickets = tickets.filter((ticket) => {
    if (filters.status && filters.status !== 'all' && ticket.status !== filters.status) {
      return false;
    }
    
    if (filters.urgency && filters.urgency !== 'all' && ticket.urgency !== filters.urgency) {
      return false;
    }
    
    if (filters.technical_area && filters.technical_area.length > 0) {
      if (!ticket.technical_area || !Array.isArray(ticket.technical_area)) {
        return false;
      }
      
      const hasMatchingArea = ticket.technical_area.some(area => 
        filters.technical_area?.includes(area));
      
      if (!hasMatchingArea) {
        return false;
      }
    }
    
    return true;
  });

  const {
    recommendedTickets,
    myApplications,
    isLoadingApplications,
    handleClaimTicket,
    fetchMyApplications,
    checkApplicationStatus
  } = useTicketApplications(
    tickets,
    isAuthenticated,
    userId,
    userType,
    fetchTickets
  );

  // Simple function to force refresh
  const handleForceRefresh = useCallback(() => {
    toast.message("Refreshing tickets...");
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    filteredTickets,
    recommendedTickets,
    myApplications,
    isLoading,
    isLoadingApplications,
    hasError,
    filters,
    showFilters,
    setShowFilters,
    dataSource,
    handleFilterChange,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets,
    fetchMyApplications,
    checkApplicationStatus
  };
};
