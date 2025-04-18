
import React, { useState } from 'react';
import { HelpRequest } from '../../../types/helpRequest';
import ClientTicketCard from './ClientTicketCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import LoadingState from '../LoadingState';
import DashboardHeader from '../DashboardHeader';
import { Filter, ListFilter, KanbanSquare } from 'lucide-react';

interface ClientTicketBoardProps {
  tickets: HelpRequest[];
  isLoading: boolean;
}

const ClientTicketBoard: React.FC<ClientTicketBoardProps> = ({ tickets, isLoading }) => {
  const [activeView, setActiveView] = useState<string>('board');
  const [showFilters, setShowFilters] = useState(false);
  
  // Group tickets by status
  const openTickets = tickets.filter(ticket => 
    ['open', 'pending', 'matching'].includes(ticket.status || 'open')
  );
  
  const inProgressTickets = tickets.filter(ticket => 
    ['claimed', 'in-progress'].includes(ticket.status || '')
  );
  
  const reviewTickets = tickets.filter(ticket => 
    ['developer-qa', 'client-review', 'client-approved'].includes(ticket.status || '')
  );
  
  const completedTickets = tickets.filter(ticket => 
    ['completed'].includes(ticket.status || '')
  );
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  const handleRefresh = () => {
    // Placeholder for refresh functionality
    console.log('Refreshing tickets...');
  };
  
  if (!tickets || tickets.length === 0) {
    return (
      <div className="py-10 text-center">
        <h3 className="text-xl font-medium mb-2">No tickets found</h3>
        <p className="text-muted-foreground">You don't have any help requests yet.</p>
      </div>
    );
  }

  const BoardColumn = ({ title, tickets, count }: { title: string, tickets: HelpRequest[], count: number }) => (
    <div className="flex-1 min-w-[280px] max-w-sm bg-card rounded-lg border">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <h3 className="font-medium text-sm">{title}</h3>
        <Badge variant="outline" className="bg-background">{count}</Badge>
      </div>
      <div className="p-2 space-y-2 min-h-[200px]">
        {tickets.length > 0 ? (
          tickets.map(ticket => (
            <ClientTicketCard key={ticket.id} ticket={ticket} compact />
          ))
        ) : (
          <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
            No tickets in this column
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <DashboardHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onRefresh={handleRefresh}
        title="Tickets Dashboard"
        description="Manage your help requests and developer applications"
      />
      
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="border-b">
          <Tabs defaultValue={activeView} value={activeView} onValueChange={setActiveView} className="w-full">
            <div className="px-4 flex items-center justify-between">
              <TabsList className="h-14 w-auto gap-4">
                <TabsTrigger value="board" className="gap-2 data-[state=active]:bg-primary/10">
                  <KanbanSquare className="h-4 w-4" />
                  Board View
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-primary/10">
                  <ListFilter className="h-4 w-4" />
                  List View
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{tickets.length} total tickets</span>
                <span>•</span>
                <span>{openTickets.length} open</span>
                <span>•</span>
                <span>{completedTickets.length} completed</span>
              </div>
            </div>
          </Tabs>
        </div>

        <TabsContent value="board" className="m-0 p-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            <BoardColumn title="Open" tickets={openTickets} count={openTickets.length} />
            <BoardColumn title="In Progress" tickets={inProgressTickets} count={inProgressTickets.length} />
            <BoardColumn title="Review" tickets={reviewTickets} count={reviewTickets.length} />
            <BoardColumn title="Completed" tickets={completedTickets} count={completedTickets.length} />
          </div>
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <div className="divide-y">
            {tickets.map(ticket => (
              <div key={ticket.id} className="p-4">
                <ClientTicketCard ticket={ticket} />
              </div>
            ))}
          </div>
        </TabsContent>
      </div>
    </div>
  );
};

export default ClientTicketBoard;
