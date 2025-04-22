
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
import ChatCommentsPanel from '../components/tickets/ChatCommentsPanel';
import { useAuth } from '../contexts/auth';
import HelpRequestHistoryDialog from '../components/help/HelpRequestHistoryDialog';
import ClientActionsPanel from "../components/tickets/ClientActionsPanel";
import TicketHistoryAccordion from "../components/tickets/TicketHistoryAccordion";
import DeveloperApplicationModal from '../components/apply/DeveloperApplicationModal';
import DeveloperQADialog from '../components/help/DeveloperQADialog';
import TicketInfo from '../components/developer-ticket-detail/TicketInfo';

const TicketActionsPanel = ({
  role,
  ticket,
  ticketId,
  userId,
  applicationStatus,
  hasApplied,
  onApply,
  fetchLatestTicketData
}: any) => {
  if (role === "developer") {
    return (
      <DeveloperApplicationPanel
        devUpdateVisibility={{
          show: !!(applicationStatus === "approved" && hasApplied),
          reason: "",
        }}
        ticket={ticket}
        ticketId={ticketId}
        userType={role}
        applicationStatus={applicationStatus}
        hasApplied={hasApplied}
        onApply={onApply}
        fetchLatestTicketData={fetchLatestTicketData}
      />
    );
  }
  if (role === "client") {
    return (
      <ClientActionsPanel
        ticket={ticket}
        userId={userId}
        onStatusUpdated={fetchLatestTicketData}
      />
    );
  }
  return null;
};

const CommentsSection = ({
  visible,
  ticket,
  ticketId,
  userId,
  role,
}: any) => {
  if (!visible) return null;
  if (role === "developer") {
    return <ChatCommentsPanel ticketId={ticketId} userId={userId} />;
  }
  return (
    <TicketComments
      ticketId={ticketId}
      userRole={role}
      userId={userId}
    />
  );
};

const ClientEditSection = ({
  visible,
  status,
  ticket,
  onTicketUpdated,
  canSubmitQA,
  onSubmitQA,
  formatDate
}: any) => {
  if (!visible) return null;
  return (
    <TicketSidebar
      ticket={ticket}
      canSubmitQA={canSubmitQA}
      onSubmitQA={onSubmitQA}
      formatDate={formatDate}
      onTicketUpdated={onTicketUpdated}
    />
  );
};

const HistorySection = ({ ticketId, ticket }: { ticketId: string, ticket: HelpRequest }) => (
  <TicketHistoryAccordion helpRequestId={ticket.id} />
);

const ProjectDetailsCard = ({ ticket, formatDate }: { ticket: HelpRequest, formatDate: (d?: string) => string }) => (
  <TicketSidebar
    ticket={ticket}
    canSubmitQA={false}
    onSubmitQA={() => {}}
    formatDate={formatDate}
  />
);

const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userType } = useAuth();
  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  // For developer features
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showQADialog, setShowQADialog] = useState(false);

  // Unified role: use currentUser.role or userType field
  const role = userType as "client" | "developer";

  // Backward-compatible ticket fetching
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

  // Developer-specific: check application status, etc.
  useEffect(() => {
    if (role !== "developer" || !isAuthenticated || !userId || !ticketId) return;

    const checkApplicationStatus = async () => {
      const { data: matchData, error: matchError } = await supabase
        .from('help_request_matches')
        .select('status')
        .eq('request_id', ticketId)
        .eq('developer_id', userId)
        .maybeSingle();

      if (matchError) return;
      if (matchData) {
        setHasApplied(true);
        setApplicationStatus(matchData.status);
      }
    };
    checkApplicationStatus();
  }, [role, isAuthenticated, userId, ticketId]);

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

  const fetchLatestTicketData = fetchTicket;

  const shortTicketId = ticket?.id ? `HELP-${ticket.id.substring(0, 8)}` : "Unknown ID";

  const formatDate = (dateString?: string) => (dateString ? new Date(dateString).toLocaleString() : 'N/A');

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to apply for this ticket');
      navigate('/login', { state: { returnTo: `/tickets/${ticketId}` } });
      return;
    }
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = async () => {
    setShowApplicationModal(false);
    setHasApplied(true);
    setApplicationStatus('pending');
    toast.success('Your application has been submitted successfully!');
    if (isAuthenticated && userId && ticketId) {
      const { data } = await supabase
        .from('help_request_matches')
        .select('status')
        .eq('request_id', ticketId)
        .eq('developer_id', userId)
        .maybeSingle();
      if (data) {
        setApplicationStatus(data.status);
      }
    }
  };

  // QA dialog handler for developers
  const handleSubmitQA = () => { setShowQADialog(true); };
  const handleQASubmitted = async () => {
    setShowQADialog(false);
    toast.success('QA submitted successfully');
    fetchLatestTicketData();
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

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <TicketHeader
          onBack={() => navigate(-1)}
          shortTicketId={shortTicketId}
          ticket={ticket}
        />
        <TicketStatusPanel ticket={ticket} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <TicketDetails ticket={{
              ...ticket,
              technical_area: ticket.technical_area || [],
            }} userRole={role} />
            {/* Comments/Chat */}
            <CommentsSection
              visible={true}
              ticket={ticket}
              ticketId={ticket.id}
              userId={userId || ""}
              role={role}
            />
            {/* History Accordion */}
            <HistorySection ticketId={ticket.id} ticket={ticket} />
          </div>
          <div>
            {/* Unified Project Details + Client Edit/QA functionality */}
            <ClientEditSection
              visible={role === "client"}
              status={ticket.status}
              ticket={ticket}
              onTicketUpdated={setTicket}
              canSubmitQA={ticket.status === "in_progress" && role === "developer"}
              onSubmitQA={handleSubmitQA}
              formatDate={formatDate}
            />

            {/* Ticket Actions Panel, e.g. client or developer actions */}
            <TicketActionsPanel
              role={role}
              ticket={ticket}
              ticketId={ticketId}
              userId={userId || ""}
              applicationStatus={applicationStatus}
              hasApplied={hasApplied}
              onApply={handleApplyClick}
              fetchLatestTicketData={fetchLatestTicketData}
            />
          </div>
        </div>
      </div>
      {/* Popups/dialogs */}
      <HelpRequestHistoryDialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        requestId={ticketId || ''}
        requestTitle={ticket?.title || ''}
      />
      <DeveloperQADialog
        isOpen={showQADialog}
        onClose={() => setShowQADialog(false)}
        requestId={ticketId || ''}
        requestTitle={ticket?.title || ''}
        onQASubmitted={handleQASubmitted}
      />
      <DeveloperApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        ticket={ticket}
        onApplicationSuccess={handleApplicationSuccess}
      />
    </Layout>
  );
};

export default TicketDetailPage;
