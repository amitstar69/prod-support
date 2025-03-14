
import React from 'react';
import TicketFilters from '../tickets/TicketFilters';

interface TicketFiltersContainerProps {
  filters: {
    status: string;
    technicalArea: string;
    urgency: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
}

const TicketFiltersContainer: React.FC<TicketFiltersContainerProps> = ({ 
  filters, 
  onFilterChange 
}) => {
  return (
    <div className="mb-6 p-4 bg-muted/30 border border-border/30 rounded-md">
      <TicketFilters 
        filters={filters} 
        onFilterChange={onFilterChange} 
      />
    </div>
  );
};

export default TicketFiltersContainer;
