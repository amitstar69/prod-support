import { useState, useCallback, useMemo } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { ClientTicketCategories, DeveloperTicketCategories } from '../../types/ticketCategories';

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
    (userType: 'developer' | 'client') => {
      if (userType === 'developer') {
        const categories: DeveloperTicketCategories = {
          openTickets: filteredTickets.filter(
            (ticket) => ticket.status === 'ready_for_pickup' || ticket.status === 'submitted'
          ),
          myTickets: filteredTickets.filter(
            (ticket) => 
              ['requirements_review', 'need_more_info', 'in_progress', 'ready_for_qa', 'qa_fail']
                .includes(ticket.status || '')
          ),
          completedTickets: filteredTickets.filter(
            (ticket) => 
              ['qa_pass', 'resolved', 'closed', 'cancelled']
                .includes(ticket.status || '')
          ),
          activeTickets: filteredTickets.filter(
            (ticket) =>
              !['qa_pass', 'resolved', 'closed', 'cancelled']
                .includes(ticket.status || '')
          ),
        };
        return categories;
      } else {
        const categories: ClientTicketCategories = {
          activeTickets: filteredTickets.filter(
            (ticket) =>
              ['submitted', 'ready_for_pickup']
                .includes(ticket.status || '')
          ),
          pendingApprovalTickets: filteredTickets.filter(
            (ticket) =>
              ticket.status === 'pending_developer_approval'
          ),
          inProgressTickets: filteredTickets.filter(
            (ticket) =>
              ['requirements_review', 'need_more_info', 'in_progress', 'ready_for_qa', 'qa_fail']
                .includes(ticket.status || '')
          ),
          completedTickets: filteredTickets.filter(
            (ticket) =>
              ['qa_pass', 'resolved', 'closed', 'cancelled']
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
