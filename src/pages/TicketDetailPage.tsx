
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Clock, History } from 'lucide-react';
import Layout from '../components/Layout';
import HelpRequestDetail from '../components/help/HelpRequestDetail';
import { HelpRequest } from '../types/helpRequest';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/auth';
import { checkTicketPermission, PermissionAction } from '../utils/permissions';
import { supabase } from '../integrations/supabase/client';
import { Card } from '../components/ui/card';
import TicketHeader from '../components/developer-ticket-detail/TicketHeader';
import TicketStatusPanel from '../components/developer-ticket-detail/TicketStatusPanel';
import TicketInfo from '../components/developer-ticket-detail/TicketInfo';
import TicketSidebar from '../components/developer-ticket-detail/TicketSidebar';
import DeveloperApplicationPanel from '../components/developer-ticket-detail/DeveloperApplicationPanel';
import { getHelpRequest, updateHelpRequest } from '../integrations/supabase/helpRequests';
import HelpRequestHistoryDialog from '../components/help/HelpRequestHistoryDialog';
import TicketEditForm from '../components/help/TicketEditForm';
import DeveloperQADialog from '../components/help/DeveloperQADialog';
import DeveloperApplicationModal from '../components/apply/DeveloperApplicationModal';

const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userType } = useAuth();
  
  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);
  
  // Application state (for developers)
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  // Edit state (for clients)
  const [isEditing, setIsEditing] = useState(false);
  
  // Dialog states
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showQADialog, setShowQADialog] = useState(false);
  
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
    
    // Subscribe to real-time updates
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
      const response = await getHelpRequest(ticketId);
      
      if (!response.success) {
        setError(response.error || 'Failed to load ticket');
        setIsLoading(false);
        return;
      }
      
      const fetchedTicket = response.data as HelpRequest;
      
      if (fetchedTicket) {
        setTicket(fetchedTicket);
        
        // Check permission
        const permission = checkTicketPermission(
          PermissionAction.VIEW_TICKET,
          userType as 'developer' | 'client' | null,
          userId,
          fetchedTicket
        );
        
        setHasPermission(permission.can);
        setPermissionMessage(permission.message || null);
        
        // For developers, check application status
        if (userType === 'developer' && userId) {
          checkDeveloperApplication(fetchedTicket.id);
        }
      } else {
        setError('Ticket not found');
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkDeveloperApplication = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('help_request_matches')
        .select('status')
        .eq('request_id', requestId)
        .eq('developer_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking application:', error);
        return;
      }
      
      if (data) {
        setHasApplied(true);
        setApplicationStatus(data.status);
      } else {
        setHasApplied(false);
        setApplicationStatus(null);
      }
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };
  
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
    
    // Refresh application status
    if (ticket) {
      checkDeveloperApplication(ticket.id);
    }
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleSaveEdit = async (updatedTicket: Partial<HelpRequest>) => {
    if (!ticket || !ticketId) return;
    
    try {
      // Only allow certain fields to be updated
      const updatedFields = {
        title: updatedTicket.title,
        description: updatedTicket.description,
        technical_area: updatedTicket.technical_area
      };
      
      const response = await updateHelpRequest(ticketId, updatedFields, 'client');
      
      if (response.success) {
        setTicket(response.data as HelpRequest);
        setIsEditing(false);
        toast.success('Ticket updated successfully');
      } else {
        toast.error(response.error || 'Failed to update ticket');
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
      toast.error('An unexpected error occurred');
    }
  };
  
  const handleSubmitQA = () => {
    setShowQADialog(true);
  };
  
  const handleQASubmitted = async () => {
    setShowQADialog(false);
    toast.success('QA submitted successfully');
    fetchTicket();
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
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
  
  if (error || !hasPermission) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {error ? 'Error Loading Ticket' : 'Access Denied'}
            </h1>
          </div>
          
          <Alert variant={error ? "destructive" : "warning"} className="mb-4">
            <AlertTitle>{error ? 'Error' : 'Access Denied'}</AlertTitle>
            <AlertDescription>
              {error || permissionMessage || 'You do not have permission to view this ticket'}
            </AlertDescription>
          </Alert>
          
          <Button onClick={() => navigate(userType === 'developer' ? '/developer/dashboard' : '/client/dashboard')}>
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
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
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
                onClick={() => navigate(userType === 'developer' ? '/developer/dashboard' : '/client/dashboard')}
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

  const shortTicketId = ticket.id ? `HELP-${ticket.id.substring(0, 8)}` : "Unknown ID";
  
  // Check if client can edit this ticket (only in early statuses)
  const canClientEdit = 
    userType === 'client' && 
    userId === ticket.client_id &&
    ['submitted', 'pending_match', 'dev_requested'].includes(ticket.status || '');
  
  // Determine which view to render based on user role
  const isDeveloperView = userType === 'developer';
  const isClientView = userType === 'client';
  
  // For developer view, determine if they can update status
  const devUpdateVisibility = {
    show:
      userType === "developer" &&
      hasApplied &&
      applicationStatus === "approved",
    reason:
      !hasApplied
        ? "You must apply to this ticket first"
        : applicationStatus === "pending"
        ? "Waiting for client approval"
        : applicationStatus === "rejected"
        ? "Rejected by client"
        : "",
  };
  
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        {/* Header - Shared between both views */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center">
                  <span className="rounded bg-blue-50 text-blue-800 border-blue-200 border px-2 py-0.5 text-xs font-medium">
                    {shortTicketId}
                  </span>
                </span>
                {ticket?.status && (
                  <span className={`
                    rounded border px-2 py-0.5 text-xs font-medium ml-2
                    ${
                      ticket.status === 'in_progress' ? 'bg-green-50 text-green-800 border-green-200' : 
                      ticket.status === 'ready_for_qa' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                      ticket.status === 'client_review' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                      ticket.status === 'client_approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      ticket.status === 'complete' ? 'bg-slate-50 text-slate-800 border-slate-200' :
                      ticket.status === 'cancelled_by_client' ? 'bg-red-50 text-red-800 border-red-200' :
                      ticket.status === 'pending_match' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      'bg-yellow-50 text-yellow-800 border-yellow-200'
                    }`
                  }>
                    {ticket.status}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold mt-1">{ticket?.title}</h1>
            </div>
          </div>
          
          {/* Action buttons in header */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryDialog(true)}
            >
              <History className="h-4 w-4 mr-1" />
              View History
            </Button>
            
            {canClientEdit && !isEditing && (
              <Button
                size="sm"
                onClick={handleEditToggle}
              >
                Edit Ticket
              </Button>
            )}
          </div>
        </div>
        
        {/* Status panel - Shared */}
        <TicketStatusPanel ticket={ticket} />
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main content area */}
          <div className="lg:col-span-2">
            {/* Client is editing */}
            {isEditing ? (
              <TicketEditForm 
                ticket={ticket} 
                onSave={handleSaveEdit} 
                onCancel={handleEditToggle}
              />
            ) : (
              /* Ticket info - shared view */
              <TicketInfo ticket={ticket} />
            )}
          </div>
          
          {/* Sidebar */}
          <div>
            {/* For developers: show application panel */}
            {isDeveloperView && (
              <DeveloperApplicationPanel
                devUpdateVisibility={devUpdateVisibility}
                ticket={ticket}
                ticketId={ticketId}
                userType={userType}
                applicationStatus={applicationStatus}
                hasApplied={hasApplied}
                onApply={handleApplyClick}
                fetchLatestTicketData={fetchTicket}
              />
            )}
            
            {/* For clients: show client actions panel */}
            {isClientView && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <HelpRequestDetail
                    ticket={ticket}
                    onUpdate={(updatedTicket) => setTicket(updatedTicket)}
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Shared sidebar content */}
            <TicketSidebar
              ticket={ticket}
              canSubmitQA={ticket?.status === "in_progress" && userType === "developer"}
              onSubmitQA={handleSubmitQA}
              formatDate={formatDate}
            />
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
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
