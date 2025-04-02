
import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onRefresh: () => void;
  title?: string;
  description?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  showFilters, 
  setShowFilters, 
  onRefresh,
  title = "Developer Dashboard",
  description = "Browse and claim available help requests from clients"
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-muted-foreground text-sm">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
