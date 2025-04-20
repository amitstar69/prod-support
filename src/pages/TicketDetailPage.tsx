
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import HelpRequestDetail from '../components/help/HelpRequestDetail';
import { getHelpRequest } from '../integrations/supabase/helpRequests';
import { HelpRequest } from '../types/helpRequest';
import LoadingState from '../components/dashboard/LoadingState';
import { toast } from '../components/ui/use-toast';
import { isApiSuccess, isApiError } from '../types/api';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) return;
      
      setIsLoading(true);
      const response = await getHelpRequest(ticketId);
      setIsLoading(false);
      
      if (isApiSuccess(response)) {
        setTicket(response.data);
      } else if (isApiError(response)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to load ticket details",
        });
        navigate('/tickets');
      }
    };

    fetchTicketDetails();
  }, [ticketId, navigate]);

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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-semibold mb-4">Ticket Detail</h1>
          <LoadingState />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Ticket Detail</h1>
        {ticket && (
          <HelpRequestDetail
            ticket={ticket}
            onUpdate={(updatedTicket: HelpRequest) => {
              setTicket(updatedTicket);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default TicketDetailPage;
