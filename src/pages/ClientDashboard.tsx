
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/auth';
import { HelpRequest, HelpRequestMatch } from '../types/helpRequest';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { 
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import DeveloperApplications from '../components/dashboard/DeveloperApplications';
import ChatDialog from '../components/chat/ChatDialog';
import { getDeveloperApplicationsForRequest } from '../integrations/supabase/helpRequests';
import { Notification } from '../integrations/supabase/notifications';
import EditHelpRequestForm from '../components/help/EditHelpRequestForm';
import CancelHelpRequestDialog from '../components/help/CancelHelpRequestDialog';
import HelpRequestHistoryDialog from '../components/help/HelpRequestHistoryDialog';
import ClientDashboardHeader from '../components/dashboard/client/ClientDashboardHeader';
import RequestList from '../components/dashboard/client/RequestList';
import { useTicketFetching } from '../hooks/dashboard/useTicketFetching';
import LoadingState from '../components/dashboard/LoadingState';

const ClientDashboard: React.FC = () => {
  const { userId, isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequestApplications, setSelectedRequestApplications] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatDeveloperId, setChatDeveloperId] = useState('');
  const [chatDeveloperName, setChatDeveloperName] = useState('Developer');
  const [applicationNotifications, setApplicationNotifications] = useState<any[]>([]);
  const [selectedRequestForEdit, setSelectedRequestForEdit] = useState<HelpRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRequestForCancel, setSelectedRequestForCancel] = useState<HelpRequest | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedRequestForHistory, setSelectedRequestForHistory] = useState<HelpRequest | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [requestMatches, setRequestMatches] = useState<Record<string, any[]>>({});

  // Use the ticket fetching hook with proper authentication status
  const {
    tickets: allTickets,
    isLoading,
    dataSource,
    fetchError,
    fetchTickets,
    handleForceRefresh
  } = useTicketFetching(isAuthenticated, userType);

  // Separate active and completed requests
  const activeRequests = allTickets.filter(ticket => 
    !['completed', 'cancelled'].includes(ticket.status || ''));
  const completedRequests = allTickets.filter(ticket => 
    ['completed', 'cancelled'].includes(ticket.status || ''));

  // Effect to set up notification subscription
  useEffect(() => {
    if (isAuthenticated && userId) {      
      const matchesChannel = supabase
        .channel('public:help_request_matches')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'help_request_matches'
        }, (payload) => {
          const match = payload.new as HelpRequestMatch;
          if (activeRequests.some(r => r.id === match.request_id)) {
            toast.info('New developer application received!', {
              action: {
                label: 'View',
                onClick: () => handleViewRequest(match.request_id)
              }
            });
            
            fetchTickets();
          }
        })
        .subscribe();
        
      const handleViewRequestEvent = (event: CustomEvent<{ requestId: string }>) => {
        const { requestId } = event.detail;
        if (requestId) {
          handleViewRequest(requestId);
        }
      };
      
      window.addEventListener('viewRequest', handleViewRequestEvent as EventListener);
      
      return () => {
        supabase.removeChannel(matchesChannel);
        window.removeEventListener('viewRequest', handleViewRequestEvent as EventListener);
      };
    } else if (!isAuthenticated && !isLoading) {
      navigate('/login', { state: { returnTo: '/client-dashboard' } });
    }
  }, [userId, isAuthenticated, activeRequests, fetchTickets, navigate, isLoading]);

  // Effect to fetch application notifications
  useEffect(() => {
    if (isAuthenticated && userId) {
      const fetchApplicationNotifications = async () => {
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('entity_type', 'application')
            .eq('is_read', false)
            .order('created_at', { ascending: false });
            
          if (error) {
            console.error('Error fetching application notifications:', error);
            return;
          }
          
          setApplicationNotifications(data || []);
        } catch (err) {
          console.error('Exception fetching application notifications:', err);
        }
      };
      
      fetchApplicationNotifications();
      
      const notificationChannel = supabase
        .channel('public:notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          const newNotification = payload.new as Notification;
          
          if (newNotification.entity_type === 'application') {
            setApplicationNotifications(prev => [newNotification, ...prev]);
            
            toast.info(newNotification.title, {
              description: newNotification.message,
              action: {
                label: 'View',
                onClick: () => {
                  handleViewApplication(newNotification.related_entity_id);
                }
              }
            });
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(notificationChannel);
      };
    }
  }, [userId, isAuthenticated]);

  const fetchApplicationsForRequest = async (requestId: string) => {
    if (!userId || !requestId) return;
    
    try {
      toast.loading('Loading developer applications...');
      const response = await getDeveloperApplicationsForRequest(requestId);
      toast.dismiss();
      
      if (response.success) {
        console.log('Applications loaded successfully:', response.data);
        setSelectedRequestApplications(response.data || []);
      } else {
        console.error('Error fetching applications:', response.error);
        toast.error('Failed to load developer applications: ' + response.error);
      }
    } catch (error) {
      toast.dismiss();
      console.error('Exception fetching applications:', error);
      toast.error('An unexpected error occurred while loading applications');
    }
  };

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    fetchApplicationsForRequest(requestId);
  };

  const handleViewApplication = async (applicationId: string) => {
    try {
      const { data, error } = await supabase
        .from('help_request_matches')
        .select('request_id')
        .eq('id', applicationId)
        .single();
        
      if (error) {
        console.error('Error fetching application details:', error);
        toast.error('Failed to load application details');
        return;
      }
      
      if (data && data.request_id) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('related_entity_id', applicationId);
          
        setApplicationNotifications(prev => 
          prev.filter(notif => notif.related_entity_id !== applicationId)
        );
        
        navigate(`/client/applications/${applicationId}`);
      }
    } catch (error) {
      console.error('Exception handling application view:', error);
      toast.error('An error occurred while loading the application');
    }
  };

  const handleOpenChat = (developerId: string, applicationId: string) => {
    try {
      if (!selectedRequestId) return;
      
      const application = selectedRequestApplications.find(app => app.id === applicationId);
      const developerName = application?.developers?.profiles?.name || 'Developer';
      
      setChatDeveloperId(developerId);
      setChatDeveloperName(developerName);
      setIsChatOpen(true);
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  const handleApplicationUpdate = () => {
    if (selectedRequestId) {
      fetchApplicationsForRequest(selectedRequestId);
      fetchTickets();
    }
  };

  const getApplicationCountForRequest = (requestId: string) => {
    return requestMatches[requestId]?.length || 0;
  };

  const getTotalNewApplicationsCount = () => {
    return applicationNotifications.length;
  };

  const handleCreateRequest = () => {
    navigate('/get-help');
  };

  // Guard for authentication check
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  const selectedRequest = selectedRequestId ? 
    [...activeRequests, ...completedRequests].find(req => req.id === selectedRequestId) : 
    null;

  const handleEditRequest = (request: HelpRequest) => {
    setSelectedRequestForEdit(request);
    setIsEditDialogOpen(true);
  };

  const handleCancelRequest = (request: HelpRequest) => {
    setSelectedRequestForCancel(request);
    setIsCancelDialogOpen(true);
  };

  const handleViewHistory = (request: HelpRequest) => {
    setSelectedRequestForHistory(request);
    setIsHistoryDialogOpen(true);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-secondary/30 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-1">Tickets Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage your help requests and developer applications
          </p>
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        {/* Show error message if tickets failed to load */}
        {fetchError && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg">
            <p className="font-medium mb-2">Error loading tickets</p>
            <p className="text-sm">{fetchError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceRefresh}
              className="mt-2 bg-white"
            >
              Try Again
            </Button>
          </div>
        )}
      
        {selectedRequestId ? (
          <div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedRequestId(null)}
              className="mb-4"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all requests
            </Button>
            
            {selectedRequest && (
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedRequest.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedRequest.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {selectedRequest.status}
                  </Badge>
                </div>
                
                <div className="flex gap-2 mb-4">
                  {selectedRequest.technical_area?.map((area: string, i: number) => (
                    <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                      {area}
                    </Badge>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold mb-2">Developer Applications</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Review and respond to developers who have applied to help with your request
                </p>
                
                <DeveloperApplications 
                  applications={selectedRequestApplications}
                  requestId={selectedRequestId}
                  clientId={userId || ''}
                  onApplicationUpdate={handleApplicationUpdate}
                  onOpenChat={handleOpenChat}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <ClientDashboardHeader
              activeRequests={activeRequests.length}
              completedRequests={completedRequests.length}
              totalNewApplications={applicationNotifications.length}
              viewMode={viewMode}
              onViewChange={setViewMode}
              onCreateRequest={handleCreateRequest}
            />
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="active">
                  Active Requests
                  {applicationNotifications.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-primary text-white">
                      {applicationNotifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">Completed Requests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                <RequestList
                  requests={activeRequests}
                  isLoading={isLoading}
                  viewMode={viewMode}
                  requestMatches={requestMatches}
                  applicationNotifications={applicationNotifications}
                  selectedApplications={selectedRequestApplications}
                  onViewRequest={handleViewRequest}
                  onEditRequest={handleEditRequest}
                  onViewHistory={handleViewHistory}
                  onCancelRequest={handleCancelRequest}
                  onCreateRequest={handleCreateRequest}
                />
              </TabsContent>
              
              <TabsContent value="completed">
                <RequestList
                  requests={completedRequests}
                  isLoading={isLoading}
                  viewMode={viewMode}
                  requestMatches={requestMatches}
                  applicationNotifications={[]}
                  selectedApplications={[]}
                  onViewRequest={handleViewRequest}
                  onEditRequest={handleEditRequest}
                  onViewHistory={handleViewHistory}
                  onCancelRequest={handleCancelRequest}
                  onCreateRequest={handleCreateRequest}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {isChatOpen && selectedRequestId && (
          <ChatDialog 
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            helpRequestId={selectedRequestId}
            otherId={chatDeveloperId}
            otherName={chatDeveloperName}
          />
        )}

        {selectedRequestForEdit && (
          <EditHelpRequestForm
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            helpRequest={selectedRequestForEdit}
            onRequestUpdated={fetchTickets}
          />
        )}

        {selectedRequestForCancel && (
          <CancelHelpRequestDialog
            isOpen={isCancelDialogOpen}
            onClose={() => setIsCancelDialogOpen(false)}
            requestId={selectedRequestForCancel.id!}
            requestTitle={selectedRequestForCancel.title}
            onRequestCancelled={fetchTickets}
          />
        )}

        {selectedRequestForHistory && (
          <HelpRequestHistoryDialog
            isOpen={isHistoryDialogOpen}
            onClose={() => setIsHistoryDialogOpen(false)}
            requestId={selectedRequestForHistory.id!}
            requestTitle={selectedRequestForHistory.title}
          />
        )}
      </div>
    </Layout>
  );
};

export default ClientDashboard;
