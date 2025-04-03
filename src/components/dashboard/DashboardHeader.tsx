
import React from 'react';
import { Filter, RefreshCw, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  showFilters?: boolean;
  setShowFilters?: (show: boolean) => void;
  onRefresh?: (showLoading?: boolean) => Promise<void>;
  hideFilterButton?: boolean;
  
  // New props to match what's being passed from ClientDashboard
  activeRequestsCount?: number;
  completedRequestsCount?: number;
  onCreateRequest?: () => void;
  totalNewApplicationsCount?: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title,
  description,
  showFilters,
  setShowFilters,
  onRefresh,
  hideFilterButton = false,
  activeRequestsCount,
  completedRequestsCount,
  onCreateRequest,
  totalNewApplicationsCount
}) => {
  const defaultTitle = "Tickets Dashboard";
  const defaultDescription = "Manage your help requests and developer applications";
  
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title || defaultTitle}</h1>
        <p className="text-muted-foreground mt-1">{description || defaultDescription}</p>
        
        {/* Show stats if activeRequestsCount and completedRequestsCount are provided */}
        {(activeRequestsCount !== undefined || completedRequestsCount !== undefined) && (
          <div className="mt-2 flex gap-4">
            <div className="text-sm">
              <span className="font-medium">{activeRequestsCount}</span> active
              {totalNewApplicationsCount ? (
                <span className="ml-1 text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                  {totalNewApplicationsCount} new
                </span>
              ) : null}
            </div>
            {completedRequestsCount !== undefined && (
              <div className="text-sm">
                <span className="font-medium">{completedRequestsCount}</span> completed
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 self-start sm:self-auto">
        {onCreateRequest && (
          <Button 
            variant="default" 
            size="sm"
            onClick={onCreateRequest}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        )}
        
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onRefresh(true)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        )}
        
        {!hideFilterButton && setShowFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
