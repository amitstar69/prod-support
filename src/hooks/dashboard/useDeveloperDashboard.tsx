
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
  
  // Memoize the fetchTickets call to prevent unnecessary re-renders
  const fetchTicketsIfNeeded = useCallback(() => {
    if (!initialFetchCompleted.current || isAuthenticated !== undefined) {
      console.log('[Developer Dashboard] Fetching tickets on auth change or initial load');
      fetchTickets();
      initialFetchCompleted.current = true;
    }
  }, [fetchTickets, isAuthenticated]);

  // Initial fetch when component mounts
  useEffect(() => {
    isMounted.current = true;
    fetchTicketsIfNeeded();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchTicketsIfNeeded]);

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
    console.log('[Developer Dashboard] Render state:', {
      isAuthenticated,
      userId,
      userType,
      ticketsCount: tickets.length,
      isLoading,
      isLoadingApplications,
    });
  }, [isAuthenticated, userId, userType, tickets, isLoading, isLoadingApplications]);

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
