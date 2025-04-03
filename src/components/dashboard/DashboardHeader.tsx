
import React from 'react';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface DashboardHeaderProps {
  activeRequestsCount: number;
  completedRequestsCount: number;
  onCreateRequest: () => void;
  totalNewApplicationsCount: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeRequestsCount,
  completedRequestsCount,
  onCreateRequest,
  totalNewApplicationsCount,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-xl font-semibold">Your Help Requests</h2>
        <p className="text-sm text-muted-foreground">
          {activeRequestsCount} active, {completedRequestsCount} completed
        </p>
      </div>
      
      <Button onClick={onCreateRequest} size="sm">
        <PlusCircle className="h-4 w-4 mr-2" />
        New Help Request
        {totalNewApplicationsCount > 0 && (
          <Badge variant="secondary" className="ml-2 bg-primary text-white">
            {totalNewApplicationsCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default DashboardHeader;
