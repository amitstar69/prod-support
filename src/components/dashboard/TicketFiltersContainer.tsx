
import React from 'react';
import TicketFilters from '../tickets/TicketFilters';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { FilterOptions } from '../tickets/TicketFilters';

interface TicketFiltersContainerProps {
  filters: FilterOptions;
  updateFilterOptions: (opts: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  getFilterLabelForStatus: (status: string) => string;
  onClose: () => void;
}

const TicketFiltersContainer: React.FC<TicketFiltersContainerProps> = ({ 
  filters,
  updateFilterOptions,
  resetFilters,
  getFilterLabelForStatus,
  onClose
}) => {
  return (
    <div className="mb-6 p-4 bg-background border border-border/30 rounded-md shadow-sm animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Filter Gigs</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <TicketFilters 
        filterOptions={filters} 
        updateFilterOptions={updateFilterOptions} 
        resetFilters={resetFilters}
        getFilterLabelForStatus={getFilterLabelForStatus}
      />
    </div>
  );
};

export default TicketFiltersContainer;
