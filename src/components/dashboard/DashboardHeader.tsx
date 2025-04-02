
import React from 'react';
import { Filter, RefreshCw, TrendingUp } from 'lucide-react';
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
  title = "Available Gigs",
  description = "Browse and apply for help requests from clients"
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-border/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 h-9"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 h-9"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
