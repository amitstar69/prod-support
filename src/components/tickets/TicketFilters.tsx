
import React from 'react';
import { Label } from '../ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';

interface TicketFiltersProps {
  filters: {
    status: string;
    technicalArea: string;
    urgency: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({ filters, onFilterChange }) => {
  // Common tech areas for filter options
  const techAreas = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 
    'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go',
    'AWS', 'Azure', 'DevOps', 'Database', 'Mobile'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label htmlFor="status-filter">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger id="status-filter" className="w-full">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="matching">Matching</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="area-filter">Technical Area</Label>
        <Select
          value={filters.technicalArea}
          onValueChange={(value) => onFilterChange('technicalArea', value)}
        >
          <SelectTrigger id="area-filter" className="w-full">
            <SelectValue placeholder="Filter by technical area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technical Areas</SelectItem>
            {techAreas.map(area => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgency-filter">Urgency</Label>
        <Select
          value={filters.urgency}
          onValueChange={(value) => onFilterChange('urgency', value)}
        >
          <SelectTrigger id="urgency-filter" className="w-full">
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
    </div>
  );
};

export default TicketFilters;
