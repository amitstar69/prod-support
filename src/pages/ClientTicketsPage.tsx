
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import TicketSection from '../components/dashboard/TicketSection';
import { useAuth } from '../contexts/auth';
import { useTicketFilters } from '../hooks/dashboard/useTicketFilters';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { HelpRequest } from '../types/helpRequest';
import { getHelpRequestsForClient } from '../integrations/supabase/helpRequests';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

const ClientTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated, userType } = useAuth();
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Using the filter utility to categorize tickets
  const { getFilteredTickets } = useTicketFilters(tickets);
  const filteredTickets = getFilteredTickets('client');

  // Initial fetch on mount
  useEffect(() => {
    if (userId) {
      fetchClientTickets();
      
      // Set up realtime subscription for ticket updates
      const channel = supabase
        .channel('client-tickets-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'help_requests',
            filter: `client_id=eq.${userId}`
          },
          () => {
            console.log('[ClientTicketsPage] Ticket changed, refreshing data');
            fetchClientTickets(false); // Don't show loading state for realtime updates
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const fetchClientTickets = async (showLoadingState = true) => {
    if (showLoadingState) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Log to help debug what's happening
      console.log('[ClientTicketsPage] Fetching tickets for client:', userId);
      console.log('[ClientTicketsPage] Current user type:', userType);

      if (!userId) {
        setError('User ID not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      const response = await getHelpRequestsForClient(userId);
      
      console.log('[ClientTicketsPage] Fetch response:', response);
      
      if (response.success && response.data) {
        setTickets(response.data);
        console.log('[ClientTicketsPage] Tickets loaded:', response.data.length, 
                    'Source:', response.storageMethod);
        
        if (response.data.length === 0) {
          console.log('[ClientTicketsPage] No tickets found for user');
        }
        
        // Show a warning if data came from localStorage
        if (response.storageMethod === 'localStorage') {
          console.warn('[ClientTicketsPage] Data loaded from localStorage instead of database');
          toast.warning('Using local data instead of database. Please check your connection.');
        }
      } else {
        console.error('[ClientTicketsPage] Error fetching tickets:', response.error);
        setError(response.error || 'Failed to load tickets');
      }
    } catch (err) {
      console.error('[ClientTicketsPage] Exception fetching tickets:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimTicket = (ticketId: string) => {
    // This is not needed for clients but required by component props
    console.log('Client claiming ticket:', ticketId);
  };

  const handleOpenChat = (helpRequestId: string, clientId: string, clientName?: string) => {
    console.log('Opening chat for request:', helpRequestId, 'with client:', clientId);
    // Implement chat opening logic here
  };

  const handleRefresh = () => {
    toast.info('Refreshing tickets...');
    fetchClientTickets();
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Help Requests</h1>
            <p className="text-muted-foreground">View and manage all your submitted requests for developer help.</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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

        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            <p className="font-medium">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-sm underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-10 pb-20">
            <TicketSection
              title="Active Help Requests"
              tickets={filteredTickets.activeTickets}
              emptyMessage="You don't have any active help requests. Create one by clicking the button above."
              onClaimTicket={handleClaimTicket}
              userId={userId}
              isAuthenticated={isAuthenticated}
              viewMode="grid"
              onOpenChat={handleOpenChat}
              onRefresh={handleRefresh}
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
        )}
      </div>
    </Layout>
  );
};

export default ClientTicketsPage;
