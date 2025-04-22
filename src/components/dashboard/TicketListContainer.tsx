
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import TicketList from '../tickets/TicketList';
import { ArrowDownUp, RefreshCw, Columns, List } from 'lucide-react';
import { Button } from '../ui/button';
import ChatDialog from '../chat/ChatDialog';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

interface TicketListContainerProps {
  filteredTickets: HelpRequest[];
  totalTickets: number;
  onClaimTicket: (ticketId: string) => void;
  userId: string | null;
  isAuthenticated: boolean;
  onRefresh?: () => void;
  isApplication?: boolean;
  onOpenChat?: (helpRequestId: string, clientId: string, clientName?: string) => void;
}

const TicketListContainer: React.FC<TicketListContainerProps> = ({ 
  filteredTickets, 
  totalTickets,
  onClaimTicket, 
  userId, 
  isAuthenticated,
  onRefresh,
  isApplication = false
}) => {
  const [chatDialogOpen, setChatDialogOpen] = React.useState(false);
  const [currentChat, setCurrentChat] = React.useState<{
    helpRequestId: string;
    otherId: string;
    otherName?: string;
  } | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Ensure we're using accurate counts
  const actualTicketCount = filteredTickets?.length || 0;
  const actualTotalCount = totalTickets || 0;

  const handleOpenChat = (helpRequestId: string, clientId: string, clientName?: string) => {
    setCurrentChat({
      helpRequestId,
      otherId: clientId,
      otherName: clientName || 'Client'
    });
    setChatDialogOpen(true);
  };

  console.log('TicketListContainer rendering with isApplication:', isApplication);

  if (actualTicketCount === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-border/40 text-center">
        <div className="h-10 w-10 mx-auto text-muted-foreground mb-3">📋</div>
        <h3 className="text-lg font-medium mb-2">No tickets found</h3>
        <p className="text-muted-foreground text-sm mb-4">
          There are no help requests available at the moment. New tickets created by clients will appear here.
        </p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" className="gap-2 text-sm" size="sm">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Tickets
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm border border-border/10 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/30 p-2 bg-muted/20">
        <div className="text-xs text-muted-foreground px-2">
          Showing {actualTicketCount} of {actualTotalCount} tickets
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
            <ToggleGroupItem value="grid" size="sm" className="h-7 w-7">
              <Columns className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" size="sm" className="h-7 w-7">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          {onRefresh && (
            <Button 
              onClick={onRefresh}
              variant="ghost" 
              size="sm"
              className="text-xs h-7 px-2 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7 px-2 flex items-center gap-1"
          >
            <ArrowDownUp className="h-3 w-3" />
            Sort
          </Button>
        </div>
      </div>
    
      <div className={viewMode === 'list' ? 'divide-y divide-border/10' : ''}>
        <TicketList 
          tickets={filteredTickets} 
          onClaimTicket={onClaimTicket} 
          currentUserId={userId} 
          isAuthenticated={isAuthenticated}
          onOpenChat={handleOpenChat}
          viewMode={viewMode}
          isApplication={isApplication}
        />
      </div>

      {currentChat && (
        <ChatDialog 
          isOpen={chatDialogOpen}
          onClose={() => setChatDialogOpen(false)}
          helpRequestId={currentChat.helpRequestId}
          otherId={currentChat.otherId}
          otherName={currentChat.otherName}
        />
      )}
    </div>
  );
};

export default TicketListContainer;
