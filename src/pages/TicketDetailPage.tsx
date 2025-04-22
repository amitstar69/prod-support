
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import Layout from '../components/Layout';
import HelpRequestDetail from '../components/help/HelpRequestDetail';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { userType } = useAuth();

  if (!ticketId) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-semibold mb-4">Ticket Detail</h1>
          <Alert>
            <AlertTitle>Missing Information</AlertTitle>
            <AlertDescription>No ticket ID provided.</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Ticket Detail</h1>
        <HelpRequestDetail
          ticketId={ticketId}
          userType={userType}
        />
      </div>
    </Layout>
  );
};

export default TicketDetailPage;
