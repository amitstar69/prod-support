
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';

export interface FilterState {
  status: string;
  technicalArea: string;
  urgency: string;
}

export interface UseTicketFiltersResult {
  filters: FilterState;
  filteredTickets: HelpRequest[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  handleFilterChange: (filterType: string, value: string) => void;
  applyFilters: (tickets: HelpRequest[]) => HelpRequest[];
}

export const useTicketFilters = (tickets: HelpRequest[]): UseTicketFiltersResult => {
  const [filteredTickets, setFilteredTickets] = useState<HelpRequest[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    technicalArea: 'all',
    urgency: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters whenever tickets or filter criteria change
  useEffect(() => {
    const result = applyFilters(tickets);
    setFilteredTickets(result);
  }, [tickets, filters]);

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

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return {
    filters,
    filteredTickets,
    showFilters,
    setShowFilters,
    handleFilterChange,
    applyFilters
  };
};
