import { useState, useCallback, useMemo } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { ClientTicketCategories, DeveloperTicketCategories } from '../../types/ticketCategories';
import { HELP_REQUEST_STATUSES } from '../../utils/constants/statusConstants';

export interface FilterState {
  technical_area: string[];
  urgency: string[];
  budget_range: string[];
  search: string;
  status: string[];
  location: string[];
}

export const useTicketFilters = (tickets: HelpRequest[]) => {
  const [filters, setFilters] = useState<FilterState>({
    technical_area: [],
    urgency: [],
    budget_range: [],
    search: '',
    status: [],
    location: [],
  });

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];

    return tickets.filter((ticket) => {
      if (
        filters.technical_area.length > 0 &&
        !filters.technical_area.some((area) =>
          (ticket.technical_area || []).includes(area)
        )
      ) {
        return false;
      }

      if (
        filters.urgency.length > 0 &&
        !filters.urgency.includes(ticket.urgency)
      ) {
        return false;
      }

      if (
        filters.budget_range.length > 0 &&
        !filters.budget_range.includes(ticket.budget_range)
      ) {
        return false;
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = ticket.title?.toLowerCase().includes(searchLower);
        const descriptionMatch = ticket.description
          ?.toLowerCase()
          .includes(searchLower);
        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }

      if (
        filters.status.length > 0 &&
        !filters.status.includes(ticket.status || '')
      ) {
        return false;
      }

      if (
        filters.location.length > 0 &&
        !filters.location.includes(ticket.preferred_developer_location || 'Global')
      ) {
        return false;
      }

      return true;
    });
  }, [tickets, filters]);

  const getFilteredTickets = useCallback(
    (userType: 'developer' | 'client' | null): ClientTicketCategories | DeveloperTicketCategories => {
      if (!userType || !tickets.length) {
        return userType === 'client' 
          ? {
              activeTickets: [],
              pendingApprovalTickets: [],
              inProgressTickets: [],
              completedTickets: []
            } as ClientTicketCategories
          : {
              openTickets: [],
              myTickets: [],
              completedTickets: [],
              activeTickets: []
            } as DeveloperTicketCategories;
      }

      if (userType === 'developer') {
        const categories: DeveloperTicketCategories = {
          openTickets: filteredTickets.filter(
            (ticket) => ticket.status === HELP_REQUEST_STATUSES.OPEN || 
                        ticket.status === HELP_REQUEST_STATUSES.SUBMITTED
          ),
          myTickets: filteredTickets.filter(
            (ticket) => 
              [HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, 
               HELP_REQUEST_STATUSES.NEED_MORE_INFO, 
               HELP_REQUEST_STATUSES.IN_PROGRESS, 
               HELP_REQUEST_STATUSES.READY_FOR_QA, 
               HELP_REQUEST_STATUSES.QA_FAIL]
                .includes(ticket.status || '')
          ),
          completedTickets: filteredTickets.filter(
            (ticket) => 
              [HELP_REQUEST_STATUSES.QA_PASS, 
               HELP_REQUEST_STATUSES.RESOLVED, 
               HELP_REQUEST_STATUSES.CLOSED, 
               HELP_REQUEST_STATUSES.CANCELLED]
                .includes(ticket.status || '')
          ),
          activeTickets: filteredTickets.filter(
            (ticket) =>
              ![HELP_REQUEST_STATUSES.QA_PASS, 
                HELP_REQUEST_STATUSES.RESOLVED, 
                HELP_REQUEST_STATUSES.CLOSED, 
                HELP_REQUEST_STATUSES.CANCELLED]
                .includes(ticket.status || '')
          ),
        };
        return categories;
      } else {
        const categories: ClientTicketCategories = {
          activeTickets: filteredTickets.filter(
            (ticket) =>
              [HELP_REQUEST_STATUSES.SUBMITTED, 
               HELP_REQUEST_STATUSES.OPEN]
                .includes(ticket.status || '')
          ),
          pendingApprovalTickets: filteredTickets.filter(
            (ticket) =>
              ticket.status === HELP_REQUEST_STATUSES.PENDING_DEVELOPER_APPROVAL ||
              ticket.status === HELP_REQUEST_STATUSES.DEV_REQUESTED ||
              ticket.status === HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL
          ),
          inProgressTickets: filteredTickets.filter(
            (ticket) =>
              [HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, 
               HELP_REQUEST_STATUSES.NEED_MORE_INFO, 
               HELP_REQUEST_STATUSES.IN_PROGRESS, 
               HELP_REQUEST_STATUSES.READY_FOR_QA, 
               HELP_REQUEST_STATUSES.QA_FAIL]
                .includes(ticket.status || '')
          ),
          completedTickets: filteredTickets.filter(
            (ticket) =>
              [HELP_REQUEST_STATUSES.QA_PASS, 
               HELP_REQUEST_STATUSES.RESOLVED, 
               HELP_REQUEST_STATUSES.CLOSED, 
               HELP_REQUEST_STATUSES.CANCELLED]
                .includes(ticket.status || '')
          ),
        };
        return categories;
      }
    },
    [filteredTickets]
  );

  const handleFilterChange = useCallback(
    (filterType: string, value: string) => {
      setFilters((prev) => {
        if (filterType === 'search') {
          return {
            ...prev,
            search: value,
          };
        } else {
          const existingValues = prev[filterType as keyof FilterState] as string[];
          const newValues = existingValues.includes(value)
            ? existingValues.filter((v) => v !== value)
            : [...existingValues, value];

          return {
            ...prev,
            [filterType]: newValues,
          };
        }
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      technical_area: [],
      urgency: [],
      budget_range: [],
      search: '',
      status: [],
      location: [],
    });
  }, []);

  const categorizedTickets = useMemo(() => {
    if (!tickets) return {
      activeTickets: [],
      pendingApprovalTickets: [],
      inProgressTickets: [],
      completedTickets: []
    };

    return {
      activeTickets: tickets.filter(
        (ticket) =>
          ticket.status === 'open' ||
          ticket.status === 'pending' ||
          ticket.status === 'matching'
      ),
      pendingApprovalTickets: tickets.filter(
        (ticket) =>
          ticket.status === 'awaiting_client_approval' ||
          ticket.status === 'dev_requested'
      ),
      inProgressTickets: tickets.filter(
        (ticket) =>
          ticket.status === 'approved' ||
          ticket.status === 'in_progress' ||
          ticket.status === 'ready_for_client_qa'
      ),
      completedTickets: tickets.filter(
        (ticket) =>
          ticket.status === 'resolved' ||
          ticket.status === 'closed' ||
          ticket.status === 'cancelled_by_client'
      ),
    };
  }, [tickets]);

  return {
    filters,
    filteredTickets,
    categorizedTickets,
    getFilteredTickets,
    handleFilterChange,
    resetFilters,
  };
};
