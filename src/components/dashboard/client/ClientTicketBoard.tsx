
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

  return (
    <Tabs defaultValue="board" value={activeView} onValueChange={setActiveView} className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="board" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Open Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Open</h3>
              <Badge variant="outline">{openTickets.length}</Badge>
            </div>
            <div className="space-y-3">
              {openTickets.length > 0 ? (
                openTickets.map(ticket => (
                  <ClientTicketCard key={ticket.id} ticket={ticket} />
                ))
              ) : (
                <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
                  No open tickets
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">In Progress</h3>
              <Badge variant="outline">{inProgressTickets.length}</Badge>
            </div>
            <div className="space-y-3">
              {inProgressTickets.length > 0 ? (
                inProgressTickets.map(ticket => (
                  <ClientTicketCard key={ticket.id} ticket={ticket} />
                ))
              ) : (
                <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
                  No tickets in progress
                </div>
              )}
            </div>
          </div>

          {/* Review Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Review</h3>
              <Badge variant="outline">{reviewTickets.length}</Badge>
            </div>
            <div className="space-y-3">
              {reviewTickets.length > 0 ? (
                reviewTickets.map(ticket => (
                  <ClientTicketCard key={ticket.id} ticket={ticket} />
                ))
              ) : (
                <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
                  No tickets in review
                </div>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Completed</h3>
              <Badge variant="outline">{completedTickets.length}</Badge>
            </div>
            <div className="space-y-3">
              {completedTickets.length > 0 ? (
                completedTickets.slice(0, 5).map(ticket => (
                  <ClientTicketCard key={ticket.id} ticket={ticket} />
                ))
              ) : (
                <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
                  No completed tickets
                </div>
              )}
              {completedTickets.length > 5 && (
                <div className="text-center text-xs text-muted-foreground">
                  + {completedTickets.length - 5} more completed tickets
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="list" className="mt-4">
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
