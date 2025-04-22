
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { useTicketFetching } from './useTicketFetching';
import { useTicketFilters } from './useTicketFilters';
import { useTicketApplications } from './useTicketApplications';
import { toast } from 'sonner';

export const useDeveloperDashboard = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { userId, userType, isAuthenticated } = useAuth();
  const initialFetchCompleted = useRef(false);
  const isMounted = useRef(true);
  const isFirstRender = useRef(true);
  
  const {
    tickets,
    isLoading,
    hasError,
    dataSource,
    fetchTickets,
    handleForceRefresh
  } = useTicketFetching(isAuthenticated, userType);

  const ticketFilters = useTicketFilters(tickets);
  const {
    filters,
    filteredTickets,
    getFilteredTickets,
    handleFilterChange,
    resetFilters
  } = ticketFilters;

  const {
    recommendedTickets,
    myApplications,
    isLoadingApplications,
    hasError: hasApplicationError,
    handleClaimTicket,
    fetchMyApplications,
    checkApplicationStatus
  } = useTicketApplications(tickets, isAuthenticated, userId, userType, fetchTickets);
  
  // Memoize the fetchTickets call to prevent unnecessary re-renders
  const fetchTicketsIfNeeded = useCallback(() => {
    // Only fetch on first render or when auth state changes
    if ((isFirstRender.current || !initialFetchCompleted.current) && isAuthenticated !== undefined) {
      console.log('[Developer Dashboard] Fetching tickets on auth change or initial load');
      fetchTickets();
      initialFetchCompleted.current = true;
      isFirstRender.current = false;
    }
  }, [fetchTickets, isAuthenticated]);

  // Initial fetch when component mounts
  useEffect(() => {
    isMounted.current = true;
    fetchTicketsIfNeeded();
    
    // Add recovery function in case of errors
    const recoveryTimeout = setTimeout(() => {
      if (hasError && isMounted.current) {
        console.log('[Developer Dashboard] Attempting recovery due to error state');
        fetchTickets(true);
      }
    }, 5000);
    
    return () => {
      isMounted.current = false;
      clearTimeout(recoveryTimeout);
    };
  }, [fetchTicketsIfNeeded, hasError, fetchTickets]);

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

  // Debug: Log render info
  useEffect(() => {
    if (isFirstRender.current) {
      console.log('[Developer Dashboard] Initial render state:', {
        isAuthenticated,
        userId,
        userType,
        ticketsCount: tickets.length,
        isLoading,
        isLoadingApplications,
        hasError,
        hasApplicationError
      });
      isFirstRender.current = false;
    }
  }, [isAuthenticated, userId, userType, tickets, isLoading, isLoadingApplications, hasError, hasApplicationError]);

  return {
    tickets,
    filteredTickets,
    recommendedTickets,
    myApplications,
    isLoading,
    isLoadingApplications,
    hasError,
    hasApplicationError,
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
    checkApplicationStatus,
    getFilteredTickets
  };
};

export default useDeveloperDashboard;
