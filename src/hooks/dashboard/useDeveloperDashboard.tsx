
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { HelpRequest } from '../../types/helpRequest';
import { useTicketFetching } from './useTicketFetching';
import { useTicketFilters } from './useTicketFilters';
import { useTicketApplications } from './useTicketApplications';
import { supabase } from '../../integrations/supabase/client';

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

  // Create categorized tickets from the filtered tickets
  const categorizedTickets = userType ? getFilteredTickets(userType) : {
    activeTickets: [],
    inProgressTickets: [],
    completedTickets: [],
    pendingApprovalTickets: []
  };
  
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
