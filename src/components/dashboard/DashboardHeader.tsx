
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardHeaderProps {
  title: string;
  description: string;
  showFilters?: boolean;
  setShowFilters?: (show: boolean) => void;
  onRefresh?: (showLoading?: boolean) => Promise<void>;
  hideFilterButton?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title,
  description,
  showFilters,
  setShowFilters,
  onRefresh,
  hideFilterButton = false
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      
      {!hideFilterButton && setShowFilters && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 self-start sm:self-center"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      )}
    </div>
  );
};

export default DashboardHeader;
