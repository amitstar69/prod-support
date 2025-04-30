
import React from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

export interface FilterOptions {
  status: string;
  urgency: string;
  technicalAreas: string[];
}

export interface TicketFiltersProps {
  filterOptions: FilterOptions;
  updateFilterOptions: (newOptions: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  getFilterLabelForStatus: (status: string) => string;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({ 
  filterOptions, 
  updateFilterOptions, 
  resetFilters,
  getFilterLabelForStatus 
}) => {
  const handleStatusChange = (value: string) => {
    updateFilterOptions({ status: value });
  };

  const handleUrgencyChange = (value: string) => {
    updateFilterOptions({ urgency: value });
  };

  const hasActiveFilters = 
    filterOptions.status !== 'all' || 
    filterOptions.urgency !== 'all' || 
    (filterOptions.technicalAreas && filterOptions.technicalAreas.length > 0);

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="w-full sm:w-auto">
          <Select
            value={filterOptions.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="awaiting_client_approval">Awaiting Approval</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-auto">
          <Select
            value={filterOptions.urgency}
            onValueChange={handleUrgencyChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency Levels</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="h-10"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filterOptions.status !== 'all' && (
            <Badge variant="outline" className="bg-muted">
              Status: {getFilterLabelForStatus(filterOptions.status)}
            </Badge>
          )}
          {filterOptions.urgency !== 'all' && (
            <Badge variant="outline" className="bg-muted">
              Urgency: {filterOptions.urgency.charAt(0).toUpperCase() + filterOptions.urgency.slice(1)}
            </Badge>
          )}
          {filterOptions.technicalAreas && filterOptions.technicalAreas.map(area => (
            <Badge key={area} variant="outline" className="bg-muted">
              {area}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketFilters;
