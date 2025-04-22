
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import TicketListContainer from './TicketListContainer';

interface TicketSectionProps {
  title: string;
  tickets: HelpRequest[];
  emptyMessage: string;
  onClaimTicket: (ticketId: string) => void;
  userId: string | null;
  isAuthenticated: boolean;
  viewMode: 'grid' | 'list';
  onOpenChat?: (helpRequestId: string, clientId: string, clientName?: string) => void;
}

const TicketSection: React.FC<TicketSectionProps> = ({
  title,
  tickets,
  emptyMessage,
  onClaimTicket,
  userId,
  isAuthenticated,
  viewMode,
  onOpenChat
}) => {
  if (tickets.length === 0) {
    return (
      <section className="tickets-section">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="tickets-section">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <TicketListContainer
        filteredTickets={tickets}
        totalTickets={tickets.length}
        onClaimTicket={onClaimTicket}
        userId={userId}
        isAuthenticated={isAuthenticated}
        onOpenChat={onOpenChat}
      />
    </section>
  );
};

export default TicketSection;
