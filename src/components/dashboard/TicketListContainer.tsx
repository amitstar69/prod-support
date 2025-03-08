
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import TicketList from '../tickets/TicketList';
import { ArrowDownUp, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface TicketListContainerProps {
  filteredTickets: HelpRequest[];
  totalTickets: number;
  onClaimTicket: (ticketId: string) => void;
  userId: string | null;
  isAuthenticated: boolean;
  onRefresh?: () => void;
}

const TicketListContainer: React.FC<TicketListContainerProps> = ({ 
  filteredTickets, 
  totalTickets,
  onClaimTicket, 
  userId, 
  isAuthenticated,
  onRefresh
}) => {
  if (filteredTickets.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
        <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
        <h3 className="text-xl font-medium mb-2">No tickets found</h3>
        <p className="text-muted-foreground mb-4">
          There are no tickets matching your current filters or no help requests have been submitted yet.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          New help requests will appear here automatically. You can also try refreshing the page.
        </p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Tickets
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/30 p-3 bg-muted/20">
        <div className="text-sm text-muted-foreground">
          Showing {filteredTickets.length} of {totalTickets} tickets
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button 
              onClick={onRefresh}
              variant="ghost" 
              size="sm"
              className="text-xs flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs flex items-center gap-1"
          >
            <ArrowDownUp className="h-3 w-3" />
            Sort
          </Button>
        </div>
      </div>
    
      <TicketList 
        tickets={filteredTickets} 
        onClaimTicket={onClaimTicket} 
        currentUserId={userId} 
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default TicketListContainer;
