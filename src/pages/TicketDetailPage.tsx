
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { HelpRequest } from '../types/helpRequest';
import { Button } from '../components/ui/button';
import { supabase } from '../integrations/supabase/client';
import TicketHeader from '../components/developer-ticket-detail/TicketHeader';
import TicketStatusPanel from '../components/developer-ticket-detail/TicketStatusPanel';
import TicketSidebar from '../components/developer-ticket-detail/TicketSidebar';
import DeveloperApplicationPanel from '../components/developer-ticket-detail/DeveloperApplicationPanel';
import TicketDetails from '../components/tickets/TicketDetails';
import TicketComments from '../components/tickets/TicketComments';
import { useAuth } from '../contexts/auth';
import HelpRequestHistoryDialog from '../components/help/HelpRequestHistoryDialog';

const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userType } = useAuth();

  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  // Unified role (fallback to 'client')
  const userRole: "client" | "developer" | "admin" = (userType as any) || 'client';

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to view this page');
      navigate('/login', { state: { returnTo: `/tickets/${ticketId}` } });
      return;
    }

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, isAuthenticated]);

  // Subscribe to real-time updates:
  useEffect(() => {
    if (!ticketId || !isAuthenticated) return;
    const channel = supabase
      .channel(`ticket-updates-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
          filter: `id=eq.${ticketId}`,
        },
        (payload) => {
          fetchTicket();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, isAuthenticated]);

  const fetchTicket = async () => {
    if (!ticketId) {
      setError('No ticket ID provided');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', ticketId)
        .maybeSingle();

      if (error || !data) {
        setError(error?.message || 'Ticket not found');
        setIsLoading(false);
        return;
      }

      setTicket(data as HelpRequest);
    } catch (err) {
      setError('Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold">Loading ticket details...</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold">Error Loading Ticket</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold">Ticket not found</h1>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  // Short ticket ID for display
  const shortTicketId = ticket.id ? `HELP-${ticket.id.substring(0, 8)}` : "Unknown ID";

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        {/* Unified Header */}
        <TicketHeader
          onBack={() => navigate(-1)}
          shortTicketId={shortTicketId}
          ticket={ticket}
        />

        {/* Ticket Status */}
        <TicketStatusPanel ticket={ticket} />

        {/* Page Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <TicketDetails ticket={{
              ...ticket,
              // Normalize for backward/forward compatibility
              technical_areas: (ticket as any).technical_areas || ticket.technical_area || [],
            }} userRole={userRole} />

            {/* Comments */}
            <TicketComments
              ticketId={ticketId || ""}
              userRole={userRole}
              userId={userId || ""}
            />
          </div>

          {/* Sidebar */}
          <div>
            <TicketSidebar
              ticket={ticket}
              canSubmitQA={ticket.status === "in_progress" && userRole === "developer"}
              onSubmitQA={() => {}} // wire up as needed
              formatDate={(dateStr?: string) => (dateStr ? new Date(dateStr).toLocaleString() : 'N/A')}
            />
          </div>
        </div>
      </div>
      {/* Ticket history dialog */}
      <HelpRequestHistoryDialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        requestId={ticketId || ''}
        requestTitle={ticket?.title || ''}
      />
    </Layout>
  );
};

export default TicketDetailPage;
