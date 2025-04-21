// Refactored: Root hook delegates to focused hooks for logic
import { useState, useEffect, useCallback } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { useRecommendedTickets } from './useRecommendedTickets';
import { useMyTicketApplications } from './useMyTicketApplications';
import { useTicketApplicationActions } from './useTicketApplicationActions';
import { useTicketApplicationsSubscriptions } from './useTicketApplicationsSubscriptions';

// Keep types matching the old interface for compatibility
export interface UseTicketApplicationsResult {
  recommendedTickets: HelpRequest[];
  myApplications: HelpRequest[];
  isLoadingApplications: boolean;
  handleClaimTicket: (ticketId: string) => void;
  fetchMyApplications: (isAuthenticated: boolean, userId: string | null) => Promise<void>;
  checkApplicationStatus: (ticketId: string, userId: string) => Promise<string | null>;
}

export const useTicketApplications = (
  tickets: HelpRequest[],
  isAuthenticated: boolean,
  userId: string | null,
  userType: string | null,
  refreshTickets: () => void
): UseTicketApplicationsResult => {
  const recommendedTickets = useRecommendedTickets(tickets, isAuthenticated, userId);
  const { myApplications, fetchMyApplications, isLoading: isLoadingApplications } = useMyTicketApplications();
  const { handleClaimTicket, checkApplicationStatus } = useTicketApplicationActions(
    isAuthenticated, userId, userType, refreshTickets, fetchMyApplications
  );

  // Memoize the function call to prevent unnecessary re-renders
  const fetchApplicationsIfAuthenticated = useCallback(() => {
    if (isAuthenticated && userId) {
      console.log('[Applications] Auto-fetching applications for user', userId);
      fetchMyApplications(isAuthenticated, userId);
    }
  }, [isAuthenticated, userId, fetchMyApplications]);
  
  // Refreshed list of applications when user changes or is authenticated
  useEffect(() => {
    fetchApplicationsIfAuthenticated();
  }, [fetchApplicationsIfAuthenticated]);

  // Real-time subscription for application status change notifications
  useTicketApplicationsSubscriptions(
    isAuthenticated,
    userId,
    userType,
    fetchMyApplications
  );

  return {
    recommendedTickets,
    myApplications,
    isLoadingApplications,
    handleClaimTicket,
    fetchMyApplications,
    checkApplicationStatus
  };
};
