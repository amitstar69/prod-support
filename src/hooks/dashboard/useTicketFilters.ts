
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { TicketStatus } from '../../utils/ticketStatusUtils';

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

  const getFilteredTickets = (userType: 'developer' | 'client' | null) => {
    if (!userType || !tickets.length) {
      return {
        openTickets: [],
        activeTickets: [],
        myTickets: [],
        completedTickets: []
      };
    }

    if (userType === 'developer') {
      return {
        openTickets: tickets.filter(t => t.status === TicketStatus.OPEN),
        myTickets: tickets.filter(t => 
          [TicketStatus.ACCEPTED, TicketStatus.IN_PROGRESS, TicketStatus.NEEDS_INFO]
            .includes(t.status as TicketStatus)
        ),
        completedTickets: tickets.filter(t => 
          [TicketStatus.COMPLETED, TicketStatus.CLOSED]
            .includes(t.status as TicketStatus)
        ),
        activeTickets: [] // For type consistency
      };
    } else {
      return {
        activeTickets: tickets.filter(t => 
          [TicketStatus.OPEN, TicketStatus.ACCEPTED, TicketStatus.IN_PROGRESS, TicketStatus.NEEDS_INFO]
            .includes(t.status as TicketStatus)
        ),
        completedTickets: tickets.filter(t => 
          [TicketStatus.COMPLETED, TicketStatus.CLOSED]
            .includes(t.status as TicketStatus)
        ),
        openTickets: [], // For type consistency
        myTickets: [] // For type consistency
      };
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
