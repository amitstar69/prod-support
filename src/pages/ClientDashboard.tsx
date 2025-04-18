import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/auth';
import { HelpRequest, HelpRequestMatch } from '../types/helpRequest';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Calendar, 
  PlusCircle, 
  Loader2, 
  User,
  Star,
  Bell,
  ArrowLeft,
  FileEdit
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { getHelpRequestsForClient } from '../integrations/supabase/helpRequests';
import DeveloperApplications from '../components/dashboard/DeveloperApplications';
import ChatDialog from '../components/chat/ChatDialog';
import { getDeveloperApplicationsForRequest } from '../integrations/supabase/helpRequests';
import { Notification } from '../integrations/supabase/notifications';
import EditHelpRequestForm from '../components/help/EditHelpRequestForm';
import CancelHelpRequestDialog from '../components/help/CancelHelpRequestDialog';
import HelpRequestHistoryDialog from '../components/help/HelpRequestHistoryDialog';
import TicketViewToggle from '../components/dashboard/TicketViewToggle';
import ClientDashboardHeader from '../components/dashboard/client/ClientDashboardHeader';
import RequestList from '../components/dashboard/client/RequestList';
import { useTicketFetching } from '../hooks/dashboard/useTicketFetching';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '../components/ui/badge';

const ClientDashboard = () => {
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequestApplications, setSelectedRequestApplications] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatDeveloperId, setChatDeveloperId] = useState('');
  const [chatDeveloperName, setChatDeveloperName] = useState('Developer');
  const [applicationNotifications, setApplicationNotifications] = useState<any[]>([]);
  const [selectedRequestForEdit, setSelectedRequestForEdit] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRequestForCancel, setSelectedRequestForCancel] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedRequestForHistory, setSelectedRequestForHistory] = useState(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchHelpRequests();
      
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
            
            fetchHelpRequests();
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
    } else {
      navigate('/login', { state: { returnTo: '/client-dashboard' } });
    }
  }, [userId, isAuthenticated]);

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
          filter: `user_id=eq.${userId} AND entity_type=eq.application`
        }, (payload) => {
          const newNotification = payload.new as Notification;
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
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(notificationChannel);
      };
    }
  }, [userId, isAuthenticated]);

  const fetchHelpRequests = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      const response = await getHelpRequestsForClient(userId);
      
      if (!response.success) {
        console.error('Error fetching help requests:', response.error);
        toast.error('Failed to load your help requests');
        return;
      }
      
      console.log('[ClientDashboard] All help requests from API:', response.data);
      
      const active: HelpRequest[] = [];
      const completed: HelpRequest[] = [];
      
      response.data.forEach((request: HelpRequest, index: number) => {
        console.log(`[ClientDashboard] Request ${index + 1}:`, {
          id: request.id,
          title: request.title,
          status: request.status
        });
        
        if (request.status === 'completed' || request.status === 'cancelled') {
          completed.push(request);
        } else {
          active.push(request);
        }
      });
      
      console.log('[ClientDashboard] Active requests:', active.length);
      console.log('[ClientDashboard] Completed requests:', completed.length);
      
      setActiveRequests(active);
      setCompletedRequests(completed);
      
      fetchRequestMatches(active.map(r => r.id!).filter(Boolean));
      
    } catch (error) {
      console.error('Exception fetching help requests:', error);
      toast.error('An unexpected error occurred while loading your requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequestMatches = async (requestIds: string[]) => {
    if (requestIds.length === 0) return;
    
    try {
      console.log('Fetching matches for requests:', requestIds);
      
      const { data, error } = await supabase
        .from('help_request_matches')
        .select('*')
        .in('request_id', requestIds)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }
      
      console.log('Matches fetched successfully:', data);
      
      const matchesByRequest: Record<string, HelpRequestMatch[]> = {};
      
      data.forEach((match) => {
        if (!matchesByRequest[match.request_id]) {
          matchesByRequest[match.request_id] = [];
        }
        matchesByRequest[match.request_id].push(match as HelpRequestMatch);
      });
      
      setRequestMatches(matchesByRequest);
      
    } catch (error) {
      console.error('Exception fetching matches:', error);
    }
  };

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
      fetchHelpRequests();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'matching':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'in-progress':
        return <BarChart3 className="h-5 w-5 text-purple-500" />;
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-indigo-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your request has been posted and is waiting for developers to apply';
      case 'matching':
        return 'Developers are applying to your request';
      case 'scheduled':
        return 'Your session has been scheduled and is awaiting start';
      case 'in-progress':
        return 'Your session is currently in progress';
      case 'completed':
        return 'Your request has been successfully completed';
      case 'cancelled':
        return 'This request has been cancelled';
      default:
        return 'Status unknown';
    }
  };

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
      fetchHelpRequests();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'matching':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'in-progress':
        return <BarChart3 className="h-5 w-5 text-purple-500" />;
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-indigo-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your request has been posted and is waiting for developers to apply';
      case 'matching':
        return 'Developers are applying to your request';
      case 'scheduled':
        return 'Your session has been scheduled and is awaiting start';
      case 'in-progress':
        return 'Your session is currently in progress';
      case 'completed':
        return 'Your request has been successfully completed';
      case 'cancelled':
        return 'This request has been cancelled';
      default:
        return 'Status unknown';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const selectedRequest = selectedRequestId ? 
    [...activeRequests, ...completedRequests].find(req => req.id === selectedRequestId) : 
    null;

  const handleEditRequest = (request: any) => {
    setSelectedRequestForEdit(request);
    setIsEditDialogOpen(true);
  };

  const handleCancelRequest = (request: any) => {
    setSelectedRequestForCancel(request);
    setIsCancelDialogOpen(true);
  };

  const handleViewHistory = (request: any) => {
    setSelectedRequestForHistory(request);
    setIsHistoryDialogOpen(true);
  };

  const {
    tickets: allTickets,
    isLoading,
    dataSource,
    fetchTickets,
    handleForceRefresh
  } = useTicketFetching(isAuthenticated, 'client');

  const activeRequests = allTickets.filter(ticket => 
    !['completed', 'cancelled'].includes(ticket.status || ''));
  const completedRequests = allTickets.filter(ticket => 
    ['completed', 'cancelled'].includes(ticket.status || ''));

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
                  {selectedRequest.technical_area.map((area: string, i: number) => (
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
                  onApplicationUpdate={handleForceRefresh}
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
                  requestMatches={{}}
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
                  requestMatches={{}}
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
            requestId={selectedRequestForCancel.id}
            requestTitle={selectedRequestForCancel.title}
            onRequestCancelled={fetchTickets}
          />
        )}

        {selectedRequestForHistory && (
          <HelpRequestHistoryDialog
            isOpen={isHistoryDialogOpen}
            onClose={() => setIsHistoryDialogOpen(false)}
            requestId={selectedRequestForHistory.id}
            requestTitle={selectedRequestForHistory.title}
          />
        )}
      </div>
    </Layout>
  );
};

export default ClientDashboard;
