
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { Loader2 } from 'lucide-react';
import { useTicketData } from '../hooks/ticket/useTicketData';
import { useStatusTransitions } from '../hooks/ticket/useStatusTransitions';
import TicketHeader from '../components/ticket-detail/TicketHeader';
import TicketDetails from '../components/tickets/TicketDetails';
import TicketActionsPanel from '../components/ticket-detail/TicketActionsPanel';
import CommentsSection from '../components/ticket-detail/CommentsSection';
import HistorySection from '../components/ticket-detail/HistorySection';

const UnifiedTicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { userId, userType } = useAuth();
  const { ticket, isLoading, error, updateTicket } = useTicketData(ticketId!);
  const { availableTransitions } = useStatusTransitions(ticket?.status || '', userType as 'client' | 'developer');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Ticket</h1>
          <p className="text-gray-600 mt-2">{error || 'Ticket not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <TicketHeader
        onBack={() => window.history.back()}
        shortTicketId={`HELP-${ticket.id.substring(0, 8)}`}
        ticket={ticket}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <TicketDetails
            ticket={ticket}
            userRole={userType}
          />
          
          <CommentsSection
            visible={true}
            ticket={ticket}
            ticketId={ticket.id}
            userId={userId || ""}
            role={userType}
          />
          
          <HistorySection
            ticketId={ticket.id}
            ticket={ticket}
          />
        </div>

        <div className="space-y-6">
          <TicketActionsPanel
            role={userType}
            ticket={ticket}
            ticketId={ticket.id}
            userId={userId || ""}
            applicationStatus={ticket.status}
            hasApplied={false}
            onApply={() => {}}
            fetchLatestTicketData={() => updateTicket({ status: ticket.status })}
          />
        </div>
      </div>
    </div>
  );
};

export default UnifiedTicketDetailPage;
