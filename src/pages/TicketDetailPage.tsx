
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/auth';
import { useHelpRequestData } from '../hooks/help-request/useHelpRequestData';
import TicketHeader from '../components/ticket-detail/TicketHeader';
import TicketDescription from '../components/ticket-detail/TicketDescription';
import TicketStatusPanel from '../components/ticket-detail/TicketStatusPanel';
import TicketActionsPanel from '../components/ticket-detail/TicketActionsPanel';
import TicketSidebar from '../components/ticket-detail/TicketSidebar';
import TicketLoading from '../components/ticket-detail/TicketLoading';
import { Separator } from '../components/ui/separator';

const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userType } = useAuth();
  
  const {
    ticket,
    isLoading,
    error,
    setTicket
  } = useHelpRequestData(ticketId);

  const handleBackClick = () => {
    if (userType === 'developer') {
      navigate('/developer-dashboard');
    } else {
      navigate('/client-dashboard');
    }
  };

  const handleStatusUpdated = () => {
    // Refresh ticket data after status update
    if (ticketId) {
      // The useHelpRequestData hook will handle the refresh via its real-time subscription
      console.log('Status updated, waiting for real-time updates');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <TicketLoading onBack={handleBackClick} />
      </Layout>
    );
  }

  if (!ticket || error) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold">Ticket Error</h1>
          </div>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "The ticket you're looking for does not exist or has been removed."}
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const shortTicketId = ticket?.id 
    ? `HELP-${ticket.ticket_number || ticket.id.substring(0, 4)}` 
    : "Unknown ID";

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <TicketHeader
          onBack={handleBackClick}
          shortTicketId={shortTicketId}
          ticket={ticket}
        />

        <TicketStatusPanel ticket={ticket} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <TicketDescription ticket={ticket} />
            
            <Separator className="my-6" />
            
            <TicketActionsPanel 
              ticketId={ticketId || ''} 
              ticket={ticket}
              userType={userType}
              onStatusUpdated={handleStatusUpdated}
            />
          </div>
          
          <div>
            <TicketSidebar 
              ticket={ticket}
              userType={userType}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetailPage;
