
import { useState, useEffect, useCallback } from 'react';
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
    handleClaimTicket,
    fetchMyApplications,
    checkApplicationStatus
  } = useTicketApplications(tickets, isAuthenticated, userId, userType, fetchTickets);
  
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
