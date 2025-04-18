
import React, { useState } from 'react';
import { HelpRequest } from '../../../types/helpRequest';
import ClientTicketCard from './ClientTicketCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import LoadingState from '../LoadingState';

interface ClientTicketBoardProps {
  tickets: HelpRequest[];
  isLoading: boolean;
}

const ClientTicketBoard: React.FC<ClientTicketBoardProps> = ({ tickets, isLoading }) => {
  const [activeView, setActiveView] = useState<string>('board');
  
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
  
  if (!tickets || tickets.length === 0) {
    return (
      <div className="py-10 text-center">
        <h3 className="text-xl font-medium mb-2">No tickets found</h3>
        <p className="text-muted-foreground">You don't have any help requests yet.</p>
      </div>
    );
  }

  const BoardColumn = ({ title, tickets, count }: { title: string, tickets: HelpRequest[], count: number }) => (
    <div className="flex-1 min-w-[280px] max-w-sm bg-secondary/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{title}</h3>
        <Badge variant="outline">{count}</Badge>
      </div>
      <div className="space-y-3">
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
    <Tabs defaultValue={activeView} value={activeView} onValueChange={setActiveView} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="board">Board View</TabsTrigger>
        <TabsTrigger value="list">List View</TabsTrigger>
      </TabsList>

      <TabsContent value="board" className="mt-4">
        <div className="flex gap-4 overflow-x-auto pb-4">
          <BoardColumn title="Open" tickets={openTickets} count={openTickets.length} />
          <BoardColumn title="In Progress" tickets={inProgressTickets} count={inProgressTickets.length} />
          <BoardColumn title="Review" tickets={reviewTickets} count={reviewTickets.length} />
          <BoardColumn title="Completed" tickets={completedTickets} count={completedTickets.length} />
        </div>
      </TabsContent>

      <TabsContent value="list">
        <div className="space-y-4">
          {tickets.map(ticket => (
            <ClientTicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ClientTicketBoard;
