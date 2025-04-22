import React from 'react';
import Layout from '../components/Layout';
import DashboardBanner from '../components/dashboard/DashboardBanner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TicketSection from '../components/dashboard/TicketSection';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/auth';
import { useTicketFilters } from '../hooks/dashboard/useTicketFilters';
import { useDeveloperDashboard } from '../hooks/dashboard/useDeveloperDashboard';
import { Plus, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuth();
  
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

  // Only show the first 3 active tickets to keep the dashboard clean
  const previewTickets = {
    activeTickets: filteredTickets.activeTickets.slice(0, 3),
    completedTickets: []
  };

  const handleOpenChat = (helpRequestId: string, clientId: string, clientName?: string) => {
    console.log('Opening chat for request:', helpRequestId, 'with client:', clientId);
    // Implement chat opening logic here
  };

  return (
    <Layout>
      <DashboardBanner />
      
      <div className="container mx-auto py-8 px-4">
        <DashboardHeader 
          showFilters={showFilters} 
          setShowFilters={setShowFilters}
          onRefresh={fetchTickets}
          title="My Help Requests"
          description="Track and manage your help requests"
        />

        <div className="space-y-8">
          <TicketSection
            title="Active Help Requests"
            tickets={previewTickets.activeTickets}
            emptyMessage="You don't have any active help requests."
            onClaimTicket={handleClaimTicket}
            userId={userId}
            isAuthenticated={isAuthenticated}
            viewMode="grid"
            onOpenChat={handleOpenChat}
          />

          {previewTickets.activeTickets.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={() => navigate('/client/tickets')}
                variant="outline"
                className="gap-2"
              >
                View All Tickets
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
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
    </Layout>
  );
};

export default ClientDashboard;
