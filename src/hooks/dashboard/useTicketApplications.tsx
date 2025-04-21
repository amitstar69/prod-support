// Refactored: Root hook delegates to focused hooks for logic
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { useRecommendedTickets } from './useRecommendedTickets';
import { useMyTicketApplications } from './useMyTicketApplications';
import { useTicketApplicationActions } from './useTicketApplicationActions';
import { useTicketApplicationsSubscriptions } from './useTicketApplicationsSubscriptions';

// Keep types matching the old interface for compatibility
export interface UseTicketApplicationsResult {
  recommendedTickets: HelpRequest[];
  myApplications: HelpRequest[];
  handleClaimTicket: (ticketId: string) => void;
  fetchMyApplications: (userId: string | null) => Promise<void>;
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
  const { myApplications, fetchMyApplications } = useMyTicketApplications();
  const { handleClaimTicket, checkApplicationStatus } = useTicketApplicationActions(
    isAuthenticated, userId, userType, refreshTickets, fetchMyApplications
  );

  // Refreshed list of applications when user changes or is authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchMyApplications(isAuthenticated, userId);
    }
  }, [isAuthenticated, userId, fetchMyApplications]);

  // Real-time subscription for application status change notifications
  useTicketApplicationsSubscriptions(
    recommendedTickets,
    isAuthenticated,
    userId,
    userType,
    (id) => fetchMyApplications(isAuthenticated, id)
  );

  return {
    recommendedTickets,
    myApplications,
    handleClaimTicket,
    fetchMyApplications: (id) => fetchMyApplications(isAuthenticated, id),
    checkApplicationStatus
  };
};
