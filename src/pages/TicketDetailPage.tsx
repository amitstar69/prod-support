
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import HelpRequestDetail from '../components/help/HelpRequestDetail';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/auth';
import { Card } from '../components/ui/card';
import DeveloperStatusUpdate from '../components/help/DeveloperStatusUpdate';
import ClientStatusUpdate from '../components/help/ClientStatusUpdate';
import { useHelpRequestData } from '../hooks/help-request/useHelpRequestData';

const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { userType } = useAuth();
  
  const {
    ticket,
    isLoading,
    error,
    setTicket
  } = useHelpRequestData(ticketId);

  // Handle missing ticket ID
  if (!ticketId) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Alert>
            <AlertTitle>Missing Information</AlertTitle>
            <AlertDescription>No ticket ID provided.</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Alert>
            <AlertTitle>Loading</AlertTitle>
            <AlertDescription>Loading ticket details...</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  // Handle error state
  if (error || !ticket) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || 'Failed to load ticket'}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="grid gap-6">
          {/* Main ticket details */}
          <HelpRequestDetail
            ticket={ticket}
            ticketId={ticketId}
            onUpdate={setTicket}
          />
          
          {/* Status update section - role specific */}
          <Card className="p-6">
            {userType === 'developer' ? (
              <DeveloperStatusUpdate
                ticketId={ticketId}
                currentStatus={ticket.status}
                onStatusUpdated={() => {
                  // Refetch ticket data to update UI
                  window.location.reload();
                }}
              />
            ) : (
              <ClientStatusUpdate
                ticketId={ticketId}
                currentStatus={ticket.status}
                onStatusUpdated={() => {
                  // Refetch ticket data to update UI
                  window.location.reload();
                }}
              />
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetailPage;
