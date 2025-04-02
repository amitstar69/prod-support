
import React from 'react';
import { 
  Clock, 
  Code, 
  AlertCircle 
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from '../ui/toggle-group';

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

  // Urgency options with colors
  const urgencyOptions = [
    { value: 'all', label: 'All', color: 'bg-gray-200 text-gray-700' },
    { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="flex flex-col space-y-4">
      {/* Status Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Badge variant="outline" className="text-xs py-0 px-1.5">
            Status
          </Badge>
        </div>
        <ToggleGroup 
          type="single" 
          value={filters.status}
          onValueChange={(value) => value && onFilterChange('status', value)}
          className="justify-start flex-wrap"
        >
          <ToggleGroupItem value="all" aria-label="All Statuses" className="text-xs h-7 px-2">
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="pending" aria-label="Pending" className="text-xs h-7 px-2">
            Pending
          </ToggleGroupItem>
          <ToggleGroupItem value="matching" aria-label="Matching" className="text-xs h-7 px-2">
            Matching
          </ToggleGroupItem>
          <ToggleGroupItem value="scheduled" aria-label="Scheduled" className="text-xs h-7 px-2">
            Scheduled
          </ToggleGroupItem>
          <ToggleGroupItem value="in-progress" aria-label="In Progress" className="text-xs h-7 px-2">
            In Progress
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Urgency Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          <Badge variant="outline" className="text-xs py-0 px-1.5">
            Urgency
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {urgencyOptions.map((option) => (
            <Badge 
              key={option.value}
              variant="outline" 
              className={`cursor-pointer ${filters.urgency === option.value ? option.color : 'bg-transparent'}`}
              onClick={() => onFilterChange('urgency', option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Technical Area Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Code className="h-4 w-4" />
          <Badge variant="outline" className="text-xs py-0 px-1.5">
            Tech Stack
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={`cursor-pointer ${filters.technicalArea === 'all' ? 'bg-gray-200 text-gray-700' : 'bg-transparent'}`}
            onClick={() => onFilterChange('technicalArea', 'all')}
          >
            All
          </Badge>
          {techAreas.map((area) => (
            <Badge 
              key={area}
              variant="outline" 
              className={`cursor-pointer ${filters.technicalArea === area ? 'bg-primary/10 text-primary' : 'bg-transparent'}`}
              onClick={() => onFilterChange('technicalArea', area)}
            >
              {area}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;
