
import { useState, useEffect } from 'react';
import { useTicketFilters } from './useTicketFilters';
import { useTicketFetching } from './useTicketFetching';
import { useTicketApplications } from './useTicketApplications';
import { useAuth } from '../../contexts/auth';
import { toast } from 'sonner';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || import.meta.env.DEV === true;

export const useDeveloperDashboard = () => {
  const { isAuthenticated, userId, userType } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(isAuthenticated ? 'recommended' : 'all');
  
  // Get ticket fetching functionality
  const {
    tickets,
    isLoading,
    dataSource,
    fetchTickets,
    handleForceRefresh,
    runDatabaseTest
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
    console.log('[useDeveloperDashboard] Initial fetch with auth status:', isAuthenticated, 'userId:', userId, 'userType:', userType);
    fetchTickets();
    
    const refreshInterval = setInterval(() => {
      console.log('[useDeveloperDashboard] Auto-refreshing tickets...');
      fetchTickets(false);
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, userId, userType]); // Add userType as dependency to refetch when auth state changes

  // Update active tab when auth state changes
  useEffect(() => {
    setActiveTab(isAuthenticated ? 'recommended' : 'all');
  }, [isAuthenticated]);

  // Debug function to check auth status - only available in development
  const debugAuthStatus = isDevelopment ? () => {
    console.log('[useDeveloperDashboard] Debug Auth Status:', {
      isAuthenticated,
      userId,
      userType
    });
    
    // Log to UI for user feedback
    if (isAuthenticated) {
      toast.info(`Auth Status: Logged in as ${userType}, ID: ${userId?.substring(0, 8)}...`);
    } else {
      toast.info('Auth Status: Not logged in');
    }
    
    // Force a refresh of tickets when debugging
    fetchTickets(true);
  } : undefined;

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
    fetchMyApplications,
    
    // Debug helpers - only available in development
    debugAuthStatus: isDevelopment ? debugAuthStatus : undefined,
    runDatabaseTest: isDevelopment ? runDatabaseTest : undefined
  };
};

export default useDeveloperDashboard;
