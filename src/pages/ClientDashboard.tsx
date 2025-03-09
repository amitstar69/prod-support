
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import { HelpRequest } from '../types/helpRequest';
import HelpRequestsTracking from '../components/help/HelpRequestsTracking';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import TicketListContainer from '../components/dashboard/TicketListContainer';
import { getClientHelpRequests } from '../integrations/supabase/helpRequests';

const ClientDashboard: React.FC = () => {
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (userId) {
        const response = await getClientHelpRequests(userId);
        if (response.success && response.data) {
          setTickets(response.data);
        }
      }
      setIsLoading(false);
    };

    fetchTickets();
  }, [userId]);

  const handleCreateRequest = () => {
    navigate('/create-help-request');
  };

  const mockClaimTicket = (ticket: HelpRequest) => {
    console.log('Claiming ticket:', ticket);
    // This function is required by TicketListContainer props but not used by clients
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="heading-2 mb-4">Client Dashboard</h1>
        <Button onClick={handleCreateRequest} className="mb-4">
          Create New Help Request
        </Button>
        <HelpRequestsTracking />
        <TicketListContainer 
          filteredTickets={tickets}
          totalTickets={tickets.length}
          onClaimTicket={mockClaimTicket}
          userId={userId || ""}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </Layout>
  );
};

export default ClientDashboard;
