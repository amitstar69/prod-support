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
import { useAuth } from '../../contexts/auth';

// Keep types matching the old interface for compatibility
export interface UseTicketApplicationsResult {
  recommendedTickets: HelpRequest[];
  myApplications: HelpRequest[];
  isLoadingApplications: boolean;
  hasError: boolean;
  hasApplicationError: boolean; // Added this line to support both naming conventions
  handleClaimTicket: (ticketId: string) => void;
  fetchMyApplications: (isAuthenticated: boolean, userId: string | null) => Promise<void>;
  checkApplicationStatus: (ticketId: string, userId: string) => Promise<string | null>;
  dataSource: string;
}

// Define interface for dashboard options
export interface DashboardOptions {
  initialFilterStatus?: string;
  showCompletedTickets?: boolean;
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
    hasApplicationError: hasError, // Add alias for compatibility
    handleClaimTicket,
    fetchMyApplications,
    checkApplicationStatus,
    // Use the dataSource from applications hook for consistency
    dataSource: applicationsDataSource
  };
};

// This is the main hook that DeveloperDashboard uses - now exported directly
// Directly export the implementation (it already defaults options = {})
export const useDeveloperDashboard = (options: DashboardOptions = {}) => {
  const { isAuthenticated, userId, userType } = useAuth();
  const {
    tickets,
    isLoading,
    dataSource,
    hasError,
    fetchTickets
  } = useTicketFetching();

  const ticketFilters = useTicketFilters(tickets);
  const [showFilters, setShowFilters] = useState(false);

  // Filter tickets based on current filter options
  const filteredTickets = tickets.filter((ticket) => {
    if (!ticket) {
      return false; // Skip null tickets
    }
    
    if (ticketFilters.filterOptions.status && 
        ticketFilters.filterOptions.status !== 'all' && 
        ticket.status !== ticketFilters.filterOptions.status) {
      return false;
    }
    
    if (ticketFilters.filterOptions.urgency && 
        ticketFilters.filterOptions.urgency !== 'all' && 
        ticket.urgency !== ticketFilters.filterOptions.urgency) {
      return false;
    }
    
    if (ticketFilters.filterOptions.technicalAreas && 
        ticketFilters.filterOptions.technicalAreas.length > 0) {
      if (!ticket.technical_area || !Array.isArray(ticket.technical_area)) {
        return false;
      }
      
      const hasMatchingArea = ticket.technical_area.some(area => 
        ticketFilters.filterOptions.technicalAreas?.includes(area));
      
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
  
  // Create categorized tickets for backwards compatibility
  const categorizedTickets = {
    active: tickets.filter(t => t && ['in_progress', 'accepted'].includes(t.status || '')),
    pending: tickets.filter(t => t && ['open', 'dev_requested', 'pending_match'].includes(t.status || '')),
    completed: tickets.filter(t => t && ['completed', 'closed'].includes(t.status || ''))
  };

  return {
    tickets,
    filteredTickets,
    recommendedTickets,
    myApplications,
    categorizedTickets,
    isLoading,
    isLoadingApplications,
    hasError,
    showFilters,
    setShowFilters,
    dataSource,
    filterOptions: ticketFilters.filterOptions,
    updateFilterOptions: ticketFilters.updateFilterOptions,
    resetFilters: ticketFilters.resetFilters,
    getFilterLabelForStatus: ticketFilters.getFilterLabelForStatus,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets,
    fetchMyApplications,
    checkApplicationStatus,
    // Add these aliases for compatibility
    filters: ticketFilters.filterOptions,
    handleFilterChange: ticketFilters.updateFilterOptions,
    hasApplicationError: hasError
  };
};

// Define a type for the hook return value to avoid circular reference
type UseDeveloperDashboardReturn = {
  tickets: HelpRequest[];
  filteredTickets: HelpRequest[];
  recommendedTickets: HelpRequest[];
  myApplications: HelpRequest[];
  categorizedTickets: {
    active: HelpRequest[];
    pending: HelpRequest[];
    completed: HelpRequest[];
  };
  isLoading: boolean;
  isLoadingApplications: boolean;
  hasError: boolean;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  dataSource: string;
  filterOptions: any;
  updateFilterOptions: (options: any) => void;
  resetFilters: () => void;
  getFilterLabelForStatus: (status: string) => string;
  handleClaimTicket: (ticketId: string) => void;
  handleForceRefresh: () => void;
  fetchTickets: () => void;
  fetchMyApplications: (isAuthenticated: boolean, userId: string | null) => Promise<void>;
  checkApplicationStatus: (ticketId: string, userId: string) => Promise<string | null>;
  filters: any;
  handleFilterChange: (options: any) => void;
  hasApplicationError: boolean;
};
