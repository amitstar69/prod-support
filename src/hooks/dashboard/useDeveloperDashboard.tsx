
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { HelpRequest } from '../../types/helpRequest';
import { useTicketFetching } from './useTicketFetching';
import { useTicketFilters } from './useTicketFilters';
import { useMyTicketApplications } from './useMyTicketApplications'; 
import { supabase } from '../../integrations/supabase/client';
import { 
  ClientTicketCategories, 
  DeveloperTicketCategories, 
  isClientCategories, 
  isDeveloperCategories 
} from '../../types/ticketCategories';

export const useDeveloperDashboard = () => {
  const { userId, isAuthenticated, userType } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Temp fix for compatibility with old API
  const { 
    tickets, 
    isLoading, 
    hasError, 
    dataSource,
    fetchTickets,
    handleForceRefresh 
  } = useTicketFetching('all');
  
  // Temporarily simplify filter handling to avoid type errors
  const {
    filteredTickets,
    filterOptions, 
    updateFilterOptions, 
    resetFilters,
    getFilterLabelForStatus
  } = useTicketFilters(tickets);
  
  // Simple adapter for compatibility with old code
  const filters = filterOptions;
  const handleFilterChange = updateFilterOptions;
  
  // Simple adapter function for getFilteredTickets
  const getFilteredTickets = (userType?: string) => {
    if (!userType || userType === 'developer') {
      return {
        openTickets: filteredTickets.filter(ticket => ticket.status === 'open'),
        myTickets: filteredTickets.filter(ticket => ticket.status === 'in_progress'),
        activeTickets: filteredTickets.filter(ticket => ['pending_match', 'awaiting_client_approval'].includes(ticket.status || '')),
        completedTickets: filteredTickets.filter(ticket => ticket.status === 'completed')
      };
    } else {
      return {
        activeTickets: filteredTickets.filter(ticket => ticket.status === 'open'),
        pendingApprovalTickets: filteredTickets.filter(ticket => ticket.status === 'pending_match'),
        inProgressTickets: filteredTickets.filter(ticket => ticket.status === 'in_progress'),
        completedTickets: filteredTickets.filter(ticket => ticket.status === 'completed')
      };
    }
  };

  // Create categorized tickets and ensure type safety
  const rawCategorizedTickets = getFilteredTickets(userType);
  
  // Create type-safe categorized tickets object
  let categorizedTickets;
  
  if (userType === 'client') {
    // Type assertion with safety check
    categorizedTickets = {
      activeTickets: 'activeTickets' in rawCategorizedTickets ? rawCategorizedTickets.activeTickets : [],
      pendingApprovalTickets: 'pendingApprovalTickets' in rawCategorizedTickets ? (rawCategorizedTickets as any).pendingApprovalTickets : [],
      inProgressTickets: 'inProgressTickets' in rawCategorizedTickets ? (rawCategorizedTickets as any).inProgressTickets : [],
      completedTickets: rawCategorizedTickets.completedTickets || []
    } as ClientTicketCategories;
  } else {
    // Type assertion with safety check
    categorizedTickets = {
      openTickets: 'openTickets' in rawCategorizedTickets ? (rawCategorizedTickets as any).openTickets : [],
      myTickets: 'myTickets' in rawCategorizedTickets ? (rawCategorizedTickets as any).myTickets : [],
      activeTickets: 'activeTickets' in rawCategorizedTickets ? rawCategorizedTickets.activeTickets : [],
      completedTickets: rawCategorizedTickets.completedTickets || []
    } as DeveloperTicketCategories;
  }
  
  // Use hook for applications
  const {
    myApplications,
    isLoading: isLoadingApplications,
    hasError: hasApplicationError,
    fetchMyApplications
  } = useMyTicketApplications();
  
  // Temporary mock functions to fix errors
  const handleClaimTicket = async () => {
    console.log('Claim ticket functionality temporarily disabled');
    toast.info('Claim ticket functionality temporarily disabled');
  };
  
  const checkApplicationStatus = async () => {
    console.log('Application status check temporarily disabled');
    return null;
  };
  
  const recommendedTickets = tickets.slice(0, 3); // Temporary implementation

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

  return {
    tickets,
    filteredTickets,
    categorizedTickets,
    recommendedTickets,
    myApplications,
    isLoading,
    isLoadingApplications,
    hasError,
    hasApplicationError,
    dataSource,
    showFilters,
    setShowFilters,
    filters,
    userId,
    isAuthenticated,
    activeTab,
    setActiveTab,
    handleFilterChange,
    resetFilters,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets,
    fetchMyApplications,
    checkApplicationStatus
  };
};

// Export default for backward compatibility
export default useDeveloperDashboard;
