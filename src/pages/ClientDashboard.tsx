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
  Bell
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

const ClientDashboard: React.FC = () => {
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('active');
  const [activeRequests, setActiveRequests] = useState<HelpRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<HelpRequest[]>([]);
  const [requestMatches, setRequestMatches] = useState<Record<string, HelpRequestMatch[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequestApplications, setSelectedRequestApplications] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatDeveloperId, setChatDeveloperId] = useState('');
  const [chatDeveloperName, setChatDeveloperName] = useState('Developer');
  const [applicationNotifications, setApplicationNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchHelpRequests();
      
      // Set up realtime subscription to help_request_matches
      const matchesChannel = supabase
        .channel('public:help_request_matches')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'help_request_matches'
        }, (payload) => {
          // Check if this match is for one of our requests
          const match = payload.new as HelpRequestMatch;
          if (activeRequests.some(r => r.id === match.request_id)) {
            toast.info('New developer application received!', {
              action: {
                label: 'View',
                onClick: () => handleViewRequest(match.request_id)
              }
            });
            
            // Refresh help requests to update counts
            fetchHelpRequests();
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(matchesChannel);
      };
    } else {
      navigate('/login', { state: { returnTo: '/client-dashboard' } });
    }
  }, [userId, isAuthenticated]);

  // Fetch application-related notifications
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
      
      // Set up subscription for new notifications
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
          
          // Show toast notification
          toast.info(newNotification.title, {
            description: newNotification.message,
            action: {
              label: 'View',
              onClick: () => {
                // Extract request_id from related_entity_id (which is the application_id)
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
      
      const active: HelpRequest[] = [];
      const completed: HelpRequest[] = [];
      
      response.data.forEach((request: HelpRequest) => {
        if (request.status === 'completed' || request.status === 'cancelled') {
          completed.push(request);
        } else {
          active.push(request);
        }
      });
      
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
      const response = await getDeveloperApplicationsForRequest(requestId);
      
      if (response.success) {
        setSelectedRequestApplications(response.data || []);
      } else {
        console.error('Error fetching applications:', response.error);
        toast.error('Failed to load developer applications');
      }
    } catch (error) {
      console.error('Exception fetching applications:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // New function to handle viewing an application from notification
  const handleViewApplication = async (applicationId: string) => {
    try {
      // First fetch the application to get the request_id
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
        // Mark related notification as read
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('related_entity_id', applicationId);
          
        // Remove from local state
        setApplicationNotifications(prev => 
          prev.filter(notif => notif.related_entity_id !== applicationId)
        );
        
        // Now view the request with this application
        handleViewRequest(data.request_id);
      }
    } catch (error) {
      console.error('Exception handling application view:', error);
      toast.error('An error occurred while loading the application');
    }
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

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    fetchApplicationsForRequest(requestId);
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your help requests and developer sessions
          </p>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your Help Requests</h2>
            <p className="text-sm text-muted-foreground">
              {activeRequests.length} active, {completedRequests.length} completed
            </p>
          </div>
          
          <Button onClick={handleCreateRequest}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Help Request
            {getTotalNewApplicationsCount() > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary text-white">
                {getTotalNewApplicationsCount()}
              </Badge>
            )}
          </Button>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active">
              Active Requests
              {getTotalNewApplicationsCount() > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary text-white">
                  {getTotalNewApplicationsCount()}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading your requests...</span>
              </div>
            ) : selectedRequestId ? (
              <>
                <div className="mb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedRequestId(null)}
                    className="mb-4"
                  >
                    ← Back to all requests
                  </Button>
                  
                  <h2 className="text-xl font-semibold mb-2">
                    Developer Applications
                  </h2>
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
              </>
            ) : activeRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRequests.map((request) => (
                  <Card key={request.id} className={`overflow-hidden ${
                    applicationNotifications.some(n => {
                      // Extract request_id from the application id
                      const appData = selectedRequestApplications.find(app => app.id === n.related_entity_id);
                      return appData && appData.request_id === request.id;
                    }) ? 'ring-2 ring-primary' : ''
                  }`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="truncate flex items-center">
                          {request.title}
                          {getApplicationCountForRequest(request.id!) > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-primary text-white">
                              {getApplicationCountForRequest(request.id!)}
                            </Badge>
                          )}
                        </CardTitle>
                        <Badge 
                          variant="outline"
                          className={`
                            ${request.status === 'in-progress' ? 'bg-green-50 text-green-800 border-green-200' : 
                             request.status === 'matching' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                             request.status === 'scheduled' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                             'bg-yellow-50 text-yellow-800 border-yellow-200'}
                          `}
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{request.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {request.technical_area.slice(0, 3).map((area, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                            {area}
                          </Badge>
                        ))}
                        {request.technical_area.length > 3 && (
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">
                            +{request.technical_area.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          {getStatusIcon(request.status || 'pending')}
                          <span>{getStatusDescription(request.status || 'pending')}</span>
                        </div>
                        
                        {request.status === 'matching' && (
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Developer applications</span>
                              <span className="font-medium">
                                {requestMatches[request.id!]?.length || 0}
                              </span>
                            </div>
                            <Progress value={
                              requestMatches[request.id!]?.length 
                                ? Math.min(requestMatches[request.id!].length * 20, 100) 
                                : 5
                            } className="h-2" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className="w-full"
                        variant={getApplicationCountForRequest(request.id!) > 0 ? "default" : "outline"}
                        onClick={() => handleViewRequest(request.id!)}
                      >
                        {getApplicationCountForRequest(request.id!) > 0 ? (
                          <>
                            <Bell className="h-4 w-4 mr-2" />
                            View Applications ({getApplicationCountForRequest(request.id!)})
                          </>
                        ) : (
                          "View Details"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
                <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
                <h3 className="text-xl font-medium mb-2">No active help requests</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any active help requests at the moment.
                </p>
                <Button onClick={handleCreateRequest}>
                  Create New Help Request
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading your requests...</span>
              </div>
            ) : completedRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="truncate">{request.title}</CardTitle>
                        <Badge 
                          variant="outline"
                          className={`
                            ${request.status === 'completed' ? 'bg-green-50 text-green-800 border-green-200' : 
                             'bg-red-50 text-red-800 border-red-200'}
                          `}
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{request.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {request.technical_area.slice(0, 3).map((area, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                      
                      {request.status === 'completed' && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-muted-foreground">Developer Rating</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => handleViewRequest(request.id!)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
                <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
                <h3 className="text-xl font-medium mb-2">No completed help requests</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any completed help requests yet.
                </p>
                <Button onClick={handleCreateRequest}>
                  Create New Help Request
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <ChatDialog 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          helpRequestId={selectedRequestId || ''}
          otherId={chatDeveloperId}
          otherName={chatDeveloperName}
        />
      </div>
    </Layout>
  );
};

export default ClientDashboard;
