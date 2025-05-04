
import { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';

export interface FilterOptions {
  status: string;
  urgency: string;
  technicalAreas: string[];
}

export const useTicketFilters = (tickets: HelpRequest[] = []) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    urgency: 'all',
    technicalAreas: [],
  });

  const updateFilterOptions = (newOptions: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newOptions }));
  };

  const resetFilters = () => {
    setFilterOptions({
      status: 'all',
      urgency: 'all',
      technicalAreas: [],
    });
  };

  const getFilterLabelForStatus = (status: string): string => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'awaiting_client_approval':
        return 'Awaiting Approval';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'closed':
        return 'Closed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
  };

  return {
    filterOptions,
    updateFilterOptions,
    resetFilters,
    getFilterLabelForStatus,
  };
};

export default useTicketFilters;
