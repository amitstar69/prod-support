
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { HELP_REQUEST_STATUSES } from '../../utils/constants/statusConstants';
import { ClientTicketCategories, DeveloperTicketCategories } from '../../types/ticketCategories';

export interface FilterState {
  status: string;
  technicalArea: string;
  urgency: string;
}

export const useTicketFilters = (tickets: HelpRequest[]) => {
  const [filteredTickets, setFilteredTickets] = useState<HelpRequest[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    technicalArea: 'all',
    urgency: 'all',
  });

  // Apply filters whenever tickets or filter criteria change
  useEffect(() => {
    setFilteredTickets(tickets);
  }, [tickets, filters]);

  const getFilteredTickets = (userType: 'developer' | 'client' | null): ClientTicketCategories | DeveloperTicketCategories => {
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
            activeTickets: [],
            completedTickets: []
          } as DeveloperTicketCategories;
    }

    if (userType === 'developer') {
      return {
        openTickets: tickets.filter(t => t.status === HELP_REQUEST_STATUSES.OPEN),
        myTickets: tickets.filter(t => 
          [HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, 
           HELP_REQUEST_STATUSES.NEED_MORE_INFO, 
           HELP_REQUEST_STATUSES.IN_PROGRESS]
            .includes(t.status as any)
        ),
        completedTickets: tickets.filter(t => 
          [HELP_REQUEST_STATUSES.RESOLVED, 
           HELP_REQUEST_STATUSES.CANCELLED]
            .includes(t.status as any)
        ),
        activeTickets: tickets.filter(t =>
          ![HELP_REQUEST_STATUSES.RESOLVED,
            HELP_REQUEST_STATUSES.CANCELLED]
            .includes(t.status as any)
        ),
      } as DeveloperTicketCategories;
    } else {
      return {
        activeTickets: tickets.filter(t => 
          [HELP_REQUEST_STATUSES.OPEN, 
           HELP_REQUEST_STATUSES.SUBMITTED]
            .includes(t.status as any)
        ),
        pendingApprovalTickets: tickets.filter(t =>
          [HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL,
           HELP_REQUEST_STATUSES.DEV_REQUESTED,
           HELP_REQUEST_STATUSES.PENDING_DEVELOPER_APPROVAL]
            .includes(t.status as any)
        ),
        inProgressTickets: tickets.filter(t =>
          [HELP_REQUEST_STATUSES.APPROVED,
           HELP_REQUEST_STATUSES.IN_PROGRESS,
           HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW,
           HELP_REQUEST_STATUSES.NEED_MORE_INFO]
            .includes(t.status as any)
        ),
        completedTickets: tickets.filter(t => 
          [HELP_REQUEST_STATUSES.RESOLVED, 
           HELP_REQUEST_STATUSES.CANCELLED]
            .includes(t.status as any)
        ),
      } as ClientTicketCategories;
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      technicalArea: 'all',
      urgency: 'all',
    });
  };

  const applyFilters = (ticketsToFilter: HelpRequest[]): HelpRequest[] => {
    let result = [...ticketsToFilter];
    
    if (filters.status !== 'all') {
      result = result.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.technicalArea !== 'all') {
      result = result.filter(ticket => 
        ticket.technical_area && ticket.technical_area.includes(filters.technicalArea)
      );
    }
    
    if (filters.urgency !== 'all') {
      result = result.filter(ticket => ticket.urgency === filters.urgency);
    }
    
    return result;
  };

  return {
    filters,
    filteredTickets,
    getFilteredTickets,
    handleFilterChange,
    resetFilters,
    applyFilters
  };
};
