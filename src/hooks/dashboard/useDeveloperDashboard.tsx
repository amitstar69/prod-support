
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { HelpRequest } from '../../types/helpRequest';
import { useTicketFetching } from './useTicketFetching';
import { useTicketFilters } from './useTicketFilters';
import { useTicketApplications } from './useTicketApplications';
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
    filteredTickets,
    handleFilterChange, 
    resetFilters,
    getFilteredTickets
  } = useTicketFilters(tickets);

  // Create categorized tickets and ensure type safety
  const rawCategorizedTickets = getFilteredTickets(userType);
  
  // Create type-safe categorized tickets object
  let categorizedTickets;
  
  if (userType === 'client') {
    // Type assertion with safety check
    categorizedTickets = {
      activeTickets: 'activeTickets' in rawCategorizedTickets ? rawCategorizedTickets.activeTickets : [],
      pendingApprovalTickets: 'pendingApprovalTickets' in rawCategorizedTickets ? (rawCategorizedTickets as ClientTicketCategories).pendingApprovalTickets : [],
      inProgressTickets: 'inProgressTickets' in rawCategorizedTickets ? (rawCategorizedTickets as ClientTicketCategories).inProgressTickets : [],
      completedTickets: rawCategorizedTickets.completedTickets || []
    } as ClientTicketCategories;
  } else {
    // Type assertion with safety check
    categorizedTickets = {
      openTickets: 'openTickets' in rawCategorizedTickets ? (rawCategorizedTickets as DeveloperTicketCategories).openTickets : [],
      myTickets: 'myTickets' in rawCategorizedTickets ? (rawCategorizedTickets as DeveloperTicketCategories).myTickets : [],
      activeTickets: 'activeTickets' in rawCategorizedTickets ? rawCategorizedTickets.activeTickets : [],
      completedTickets: rawCategorizedTickets.completedTickets || []
    } as DeveloperTicketCategories;
  }
  
  // Use hook for applications
  const {
    recommendedTickets,
    myApplications,
    isLoadingApplications,
    hasError: hasApplicationError,
    handleClaimTicket,
    fetchMyApplications,
    checkApplicationStatus,
  } = useTicketApplications(
    tickets,
    isAuthenticated,
    userId,
    userType,
    handleForceRefresh
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
