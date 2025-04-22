
import React from 'react';
import Layout from '../components/Layout';
import TicketSection from '../components/dashboard/TicketSection';
import { useAuth } from '../contexts/auth';
import { useTicketFilters } from '../hooks/dashboard/useTicketFilters';
import { useDeveloperDashboard } from '../hooks/dashboard/useDeveloperDashboard';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const ClientTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuth();

  // Use the shared dashboard hook, but just for tickets, not dashboard logic/UI
  const {
    tickets,
    isLoading,
    showFilters,
    setShowFilters,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets
  } = useDeveloperDashboard();

  const { getFilteredTickets } = useTicketFilters(tickets);
  const filteredTickets = getFilteredTickets('client');

  const handleOpenChat = (helpRequestId: string, clientId: string, clientName?: string) => {
    // Chat opening logic here (already provided elsewhere)
    console.log('Open chat:', helpRequestId, clientId);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Support Tickets</h1>
            <p className="text-muted-foreground">View and manage all your submitted requests for developer help.</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              onClick={() => navigate('/get-help')}
              className="gap-2"
              size="lg"
            >
              <Plus className="h-4 w-4" />
              Create New Help Request
            </Button>
          </div>
        </div>

        <div className="space-y-10 pb-20">
          <TicketSection
            title="Active Help Requests"
            tickets={filteredTickets.activeTickets}
            emptyMessage="You don't have any active help requests."
            onClaimTicket={handleClaimTicket}
            userId={userId}
            isAuthenticated={isAuthenticated}
            viewMode="grid"
            onOpenChat={handleOpenChat}
          />
          <TicketSection
            title="Completed Help Requests"
            tickets={filteredTickets.completedTickets}
            emptyMessage="No completed help requests yet."
            onClaimTicket={handleClaimTicket}
            userId={userId}
            isAuthenticated={isAuthenticated}
            viewMode="grid"
            onOpenChat={handleOpenChat}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ClientTicketsPage;
