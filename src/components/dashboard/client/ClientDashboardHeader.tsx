
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import TicketViewToggle from '../TicketViewToggle';

interface ClientDashboardHeaderProps {
  activeRequests: number;
  completedRequests: number;
  totalNewApplications: number;
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
  onCreateRequest: () => void;
}

const ClientDashboardHeader: React.FC<ClientDashboardHeaderProps> = ({
  activeRequests,
  completedRequests,
  totalNewApplications,
  viewMode,
  onViewChange,
  onCreateRequest
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-xl font-semibold">Your Help Requests</h2>
        <p className="text-sm text-muted-foreground">
          {activeRequests} active, {completedRequests} completed
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <TicketViewToggle viewMode={viewMode} onViewChange={onViewChange} />
        
        <Button onClick={onCreateRequest} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Help Request
          {totalNewApplications > 0 && (
            <Badge variant="secondary" className="ml-2 bg-primary text-white">
              {totalNewApplications}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ClientDashboardHeader;
