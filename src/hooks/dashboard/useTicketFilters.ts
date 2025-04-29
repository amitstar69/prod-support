import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { HELP_REQUEST_STATUSES } from '../../utils/constants/statusConstants';

interface FilterOptions {
  searchTerm: string;
  technicalAreas: string[];
  status: string;
  complexity: string;
  urgency: string;
}

const getFilterLabelForStatus = (status: string) => {
  // Map old statuses to new ones for compatibility
  const statusMapping = {
    'submitted': HELP_REQUEST_STATUSES.OPEN,
    'dev_requested': HELP_REQUEST_STATUSES.PENDING_MATCH,
    'pending_developer_approval': HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL
  };
  
  const normalizedStatus = statusMapping[status] || status;
  
  switch (normalizedStatus) {
    case HELP_REQUEST_STATUSES.OPEN:
      return 'Open';
    case HELP_REQUEST_STATUSES.PENDING_MATCH:
      return 'Pending Match';
    case HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL:
      return 'Awaiting Approval';
    case HELP_REQUEST_STATUSES.IN_PROGRESS:
      return 'In Progress';
    case HELP_REQUEST_STATUSES.COMPLETED:
      return 'Completed';
    case HELP_REQUEST_STATUSES.CANCELLED:
      return 'Cancelled';
    default:
      return 'All Tickets';
  }
};

export const useTicketFilters = (tickets: HelpRequest[]) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    technicalAreas: [],
    status: '',
    complexity: '',
    urgency: ''
  });
  const [filteredTickets, setFilteredTickets] = useState<HelpRequest[]>(tickets);

  useEffect(() => {
    applyFilters();
  }, [filterOptions, tickets]);

  const updateFilterOptions = (newOptions: Partial<FilterOptions>) => {
    setFilterOptions(prevOptions => ({
      ...prevOptions,
      ...newOptions
    }));
  };

  const applyFilters = () => {
    let results = [...tickets];

    if (filterOptions.searchTerm) {
      results = results.filter(ticket =>
        ticket.title?.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(filterOptions.searchTerm.toLowerCase())
      );
    }

    if (filterOptions.technicalAreas.length > 0) {
      results = results.filter(ticket =>
        ticket.technical_area?.some(area => filterOptions.technicalAreas.includes(area))
      );
    }

    if (filterOptions.status) {
      results = results.filter(ticket => ticket.status === filterOptions.status);
    }

    if (filterOptions.complexity) {
      results = results.filter(ticket => ticket.complexity_level === filterOptions.complexity);
    }

    if (filterOptions.urgency) {
      results = results.filter(ticket => ticket.urgency === filterOptions.urgency);
    }

    setFilteredTickets(results);
  };

  const resetFilters = () => {
    setFilterOptions({
      searchTerm: '',
      technicalAreas: [],
      status: '',
      complexity: '',
      urgency: ''
    });
  };

  return {
    filterOptions,
    filteredTickets,
    updateFilterOptions,
    resetFilters,
    getFilterLabelForStatus
  };
};
