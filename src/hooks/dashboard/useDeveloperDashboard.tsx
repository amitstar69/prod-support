
import { useState, useEffect } from 'react';
import { useTicketFilters } from './useTicketFilters';
import { useTicketFetching } from './useTicketFetching';
import { useTicketApplications } from './useTicketApplications';
import { useAuth } from '../../contexts/auth';

export const useDeveloperDashboard = () => {
  const { isAuthenticated, userId, userType } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(isAuthenticated ? 'recommended' : 'all');
  
  // Get ticket fetching functionality
  const {
    tickets,
    isLoading,
    dataSource,
    fetchTickets,
    handleForceRefresh
  } = useTicketFetching(isAuthenticated, userType);

  // Get filtering functionality
  const {
    filters,
    filteredTickets,
    showFilters,
    setShowFilters,
    handleFilterChange
  } = useTicketFilters(tickets);

  // Get applications functionality
  const {
    recommendedTickets,
    myApplications,
    handleClaimTicket,
    fetchMyApplications
  } = useTicketApplications(tickets, isAuthenticated, userId, userType, fetchTickets);

  // Initial data fetch
  useEffect(() => {
    fetchTickets();
    
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing tickets...');
      fetchTickets(false);
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  // Update active tab when auth state changes
  useEffect(() => {
    setActiveTab(isAuthenticated ? 'recommended' : 'all');
  }, [isAuthenticated]);

  return {
    // Ticket data states
    tickets,
    filteredTickets,
    recommendedTickets,
    myApplications,
    isLoading,
    
    // Filter states and handlers
    filters,
    showFilters,
    setShowFilters,
    handleFilterChange,
    
    // User state
    isAuthenticated,
    userId,
    activeTab,
    setActiveTab,
    
    // Data source info
    dataSource,
    
    // Action handlers
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets,
    fetchMyApplications
  };
};

export default useDeveloperDashboard;
