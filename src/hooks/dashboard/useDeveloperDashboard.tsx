
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { useTicketFetching } from './useTicketFetching';
import { useTicketFilters } from './useTicketFilters';
import { useTicketApplications } from './useTicketApplications';

export const useDeveloperDashboard = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { userId, userType, isAuthenticated } = useAuth();
  const initialFetchCompleted = useRef(false);
  
  const {
    tickets,
    isLoading,
    dataSource,
    fetchTickets,
    handleForceRefresh
  } = useTicketFetching(isAuthenticated, userType);

  const {
    filters,
    filteredTickets,
    handleFilterChange,
    resetFilters
  } = useTicketFilters(tickets);

  const {
    recommendedTickets,
    myApplications,
    isLoadingApplications,
    handleClaimTicket,
    fetchMyApplications,
    checkApplicationStatus
  } = useTicketApplications(tickets, isAuthenticated, userId, userType, fetchTickets);
  
  useEffect(() => {
    // Only fetch on initial mount and when auth state changes
    if (!initialFetchCompleted.current || isAuthenticated !== undefined) {
      console.log('Fetching tickets on auth change or initial load');
      fetchTickets();
      initialFetchCompleted.current = true;
    }
  }, [fetchTickets, isAuthenticated]);

  // Listen for viewMyApplication events dispatched from notifications
  useEffect(() => {
    const handleViewApplication = (event: Event) => {
      const customEvent = event as CustomEvent<{ticketId: string}>;
      if (customEvent.detail?.ticketId) {
        navigate(`/developer/tickets/${customEvent.detail.ticketId}`);
      }
    };
    
    window.addEventListener('viewMyApplication', handleViewApplication);
    
    return () => {
      window.removeEventListener('viewMyApplication', handleViewApplication);
    };
  }, [navigate]);

  return {
    tickets,
    filteredTickets,
    recommendedTickets,
    myApplications,
    isLoading,
    isLoadingApplications,
    filters,
    showFilters,
    setShowFilters,
    isAuthenticated,
    userId,
    activeTab,
    setActiveTab,
    dataSource,
    handleFilterChange,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets,
    resetFilters,
    fetchMyApplications,
    checkApplicationStatus
  };
};

export default useDeveloperDashboard;
