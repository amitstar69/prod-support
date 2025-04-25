
import { useState, useCallback, useMemo } from 'react';
import { HelpRequest } from '../../types/helpRequest';

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

  // Apply filters to tickets
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];

    return tickets.filter((ticket) => {
      // Apply technical area filter
      if (
        filters.technical_area.length > 0 &&
        !filters.technical_area.some((area) =>
          (ticket.technical_area || []).includes(area)
        )
      ) {
        return false;
      }

      // Apply urgency filter
      if (
        filters.urgency.length > 0 &&
        !filters.urgency.includes(ticket.urgency)
      ) {
        return false;
      }

      // Apply budget filter
      if (
        filters.budget_range.length > 0 &&
        !filters.budget_range.includes(ticket.budget_range)
      ) {
        return false;
      }

      // Apply search filter
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

      // Apply status filter
      if (
        filters.status.length > 0 &&
        !filters.status.includes(ticket.status || '')
      ) {
        return false;
      }

      // Apply location filter
      if (
        filters.location.length > 0 &&
        !filters.location.includes(ticket.preferred_developer_location || 'Global')
      ) {
        return false;
      }

      return true;
    });
  }, [tickets, filters]);

  // Organize tickets by category based on user type
  const getFilteredTickets = useCallback(
    (userType: 'developer' | 'client') => {
      if (userType === 'developer') {
        return {
          openTickets: filteredTickets.filter(
            (ticket) => ticket.status === 'open' || ticket.status === 'pending'
          ),
          myTickets: filteredTickets.filter(
            (ticket) => ticket.developer_id === 'current_user_id'
          ), // Replace with actual logic
          completedTickets: filteredTickets.filter(
            (ticket) => ticket.status === 'resolved' || ticket.status === 'closed'
          ),
          activeTickets: filteredTickets.filter(
            (ticket) =>
              ticket.status !== 'resolved' &&
              ticket.status !== 'closed' &&
              ticket.status !== 'cancelled_by_client'
          ),
        };
      } else {
        // Client categorization
        return {
          activeTickets: filteredTickets.filter(
            (ticket) =>
              ticket.status === 'open' ||
              ticket.status === 'pending' ||
              ticket.status === 'matching'
          ),
          pendingApprovalTickets: filteredTickets.filter(
            (ticket) =>
              ticket.status === 'awaiting_client_approval' ||
              ticket.status === 'dev_requested'
          ),
          inProgressTickets: filteredTickets.filter(
            (ticket) =>
              ticket.status === 'approved' ||
              ticket.status === 'in_progress' ||
              ticket.status === 'ready_for_client_qa'
          ),
          completedTickets: filteredTickets.filter(
            (ticket) =>
              ticket.status === 'resolved' ||
              ticket.status === 'closed' ||
              ticket.status === 'cancelled_by_client'
          ),
        };
      }
    },
    [filteredTickets]
  );

  // Helper function to handle filter changes
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

  // Reset all filters
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

  // Calculate categorized tickets
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
