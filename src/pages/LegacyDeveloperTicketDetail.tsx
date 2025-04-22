import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Clock, Zap, DollarSign, Code, MessageSquare, 
  CalendarClock, FileCode, Users, Award, ClipboardCheck, Loader2, ShieldAlert
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/auth';
import { supabase } from '../integrations/supabase/client';
import { HelpRequest, HelpRequestMatch } from '../types/helpRequest';
import DeveloperApplicationModal from '../components/apply/DeveloperApplicationModal';
import DeveloperQADialog from '../components/help/DeveloperQADialog';
import DeveloperStatusUpdate from '../components/help/DeveloperStatusUpdate';
import ClientStatusUpdate from '../components/help/ClientStatusUpdate';
import { getAllowedStatusTransitions } from '../utils/helpRequestStatusUtils';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { getStatusLabel } from '../utils/helpRequestStatusUtils';
import RequestStatusFlow from '../components/help/RequestStatusFlow';
import TicketHeader from '../components/developer-ticket-detail/TicketHeader';
import TicketStatusPanel from '../components/developer-ticket-detail/TicketStatusPanel';
import DeveloperApplicationPanel from '../components/developer-ticket-detail/DeveloperApplicationPanel';
import TicketInfo from '../components/developer-ticket-detail/TicketInfo';
import TicketSidebar from '../components/developer-ticket-detail/TicketSidebar';

const DeveloperTicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userType } = useAuth();
  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showQADialog, setShowQADialog] = useState(false);
  const [canUpdateStatus, setCanUpdateStatus] = useState(false);
  
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userType !== 'developer')) {
      toast.error('You must be logged in as a developer to view this page');
      navigate('/login', { state: { returnTo: `/developer/tickets/${ticketId}` } });
    }
  }, [isAuthenticated, userType, isLoading, navigate, ticketId]);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) {
        setIsLoading(false);
        toast.error('Invalid ticket ID');
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data: ticketData, error: ticketError } = await supabase
          .from('help_requests')
          .select('*')
          .eq('id', ticketId)
          .single();
        
        if (ticketError) {
          console.error('Error fetching ticket:', ticketError);
          toast.error('Failed to load ticket details');
          return;
        }
        
        setTicket(ticketData as HelpRequest);
        
        if (isAuthenticated && userId) {
          const { data: matchData, error: matchError } = await supabase
            .from('help_request_matches')
            .select('status')
            .eq('request_id', ticketId)
            .eq('developer_id', userId)
            .maybeSingle();
          
          if (matchError) {
            console.error('Error checking application status:', matchError);
          } else if (matchData) {
            setHasApplied(true);
            setApplicationStatus(matchData.status);
            
            if (matchData.status === 'approved') {
              setCanUpdateStatus(true);
            }
          }
          
          if (ticketData) {
            const canUpdate = ['approved', 'in_progress', 'ready_for_qa'].includes(ticketData.status);
            if (matchData?.status === 'approved' && canUpdate) {
              setCanUpdateStatus(true);
            }
          }
        }
      } catch (error) {
        console.error('Exception in fetchTicketDetails:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchTicketDetails();
    } else {
      setIsLoading(false);
    }
  }, [ticketId, isAuthenticated, userId]);
  
  const fetchLatestTicketData = async () => {
    if (!ticketId) return;
    
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', ticketId)
        .single();
        
      if (error) {
        console.error('Error fetching ticket:', error);
        return;
      }
      
      if (data) {
        setTicket(data as HelpRequest);
      }
    } catch (error) {
      console.error('Exception in fetchLatestTicketData:', error);
    }
  };
  
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
          console.log('Ticket update received:', payload);
          fetchLatestTicketData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, isAuthenticated]);
  
  const handleBackClick = () => {
    navigate('/developer-dashboard');
  };
  
  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to apply for this ticket');
      navigate('/login', { state: { returnTo: `/developer/tickets/${ticketId}` } });
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
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const handleSubmitQA = () => {
    setShowQADialog(true);
  };
  
  const handleQASubmitted = async () => {
    setShowQADialog(false);
    toast.success('QA submitted successfully');
    
    if (ticketId) {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', ticketId)
        .single();
        
      if (!error && data) {
        setTicket(data as HelpRequest);
      }
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackClick}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Loading ticket details...</h1>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!ticket) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackClick}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Ticket not found</h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">The ticket you're looking for does not exist or has been removed.</p>
              <Button 
                onClick={handleBackClick} 
                className="mt-4"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const shortTicketId = ticket?.id ? `HELP-${ticket.id.substring(0, 4)}` : "Unknown ID";

  const devUpdateVisibility = {
    show:
      userType === "developer" &&
      hasApplied &&
      applicationStatus === "approved",
    reason:
      !hasApplied
        ? ""
        : applicationStatus === "pending"
        ? "Waiting for client approval"
        : applicationStatus === "rejected"
        ? "Rejected by client"
        : (applicationStatus === "approved" &&
            getAllowedStatusTransitions(ticket.status, "developer").length === 0)
        ? "No available developer transitions"
        : "",
  };

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <TicketHeader
          onBack={() => navigate('/developer-dashboard')}
          shortTicketId={shortTicketId}
          ticket={ticket}
        />

        <TicketStatusPanel ticket={ticket} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TicketInfo ticket={ticket} />
          </div>
          <div>
            <DeveloperApplicationPanel
              devUpdateVisibility={devUpdateVisibility}
              ticket={ticket}
              ticketId={ticketId}
              userType={userType}
              applicationStatus={applicationStatus}
              hasApplied={hasApplied}
              onApply={handleApplyClick}
              fetchLatestTicketData={fetchLatestTicketData}
            />
            <TicketSidebar
              ticket={ticket}
              canSubmitQA={ticket?.status === "in_progress" && userType === "developer"}
              onSubmitQA={handleSubmitQA}
              formatDate={formatDate}
            />
          </div>
        </div>
      </div>
      
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

export default DeveloperTicketDetail;
