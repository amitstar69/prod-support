
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest, HelpRequestMatch } from '../../types/helpRequest';
import { toast } from 'sonner';
import { getHelpRequestsForClient, getDeveloperApplicationsForRequest } from '../../integrations/supabase/helpRequests';
import { Notification } from '../../integrations/supabase/notifications';

interface UseClientDashboardResult {
  activeRequests: HelpRequest[];
  completedRequests: HelpRequest[];
  isLoading: boolean;
  requestMatches: Record<string, HelpRequestMatch[]>;
  selectedRequestId: string | null;
  selectedRequestApplications: any[];
  selectedRequest: HelpRequest | null;
  applicationNotifications: Notification[];
  isChatOpen: boolean;
  chatDeveloperId: string;
  chatDeveloperName: string;
  selectedRequestForEdit: HelpRequest | null;
  isEditDialogOpen: boolean;
  selectedRequestForCancel: HelpRequest | null;
  isCancelDialogOpen: boolean;
  selectedRequestForHistory: HelpRequest | null;
  isHistoryDialogOpen: boolean;
  handleViewRequest: (requestId: string) => void;
  handleCreateRequest: () => void;
  handleEditRequest: (request: HelpRequest) => void;
  handleCancelRequest: (request: HelpRequest) => void;
  handleViewHistory: (request: HelpRequest) => void;
  handleOpenChat: (developerId: string, applicationId: string) => void;
  handleApplicationUpdate: () => void;
  getApplicationCountForRequest: (requestId: string) => number;
  getTotalNewApplicationsCount: () => number;
  setSelectedRequestId: (id: string | null) => void;
  setIsChatOpen: (isOpen: boolean) => void;
  setIsEditDialogOpen: (isOpen: boolean) => void;
  setIsCancelDialogOpen: (isOpen: boolean) => void;
  setIsHistoryDialogOpen: (isOpen: boolean) => void;
  fetchHelpRequests: () => Promise<void>;
}

export const useClientDashboard = (userId: string | null): UseClientDashboardResult => {
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
  const [selectedRequestForEdit, setSelectedRequestForEdit] = useState<HelpRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRequestForCancel, setSelectedRequestForCancel] = useState<HelpRequest | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedRequestForHistory, setSelectedRequestForHistory] = useState<HelpRequest | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

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
      
      response.data?.forEach((request: HelpRequest) => {
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
        
        handleViewRequest(data.request_id);
      }
    } catch (error) {
      console.error('Exception handling application view:', error);
      toast.error('An error occurred while loading the application');
    }
  };

  const handleCreateRequest = () => {
    window.location.href = '/get-help';
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

  // Initialize the dashboard
  useEffect(() => {
    if (userId) {
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
        
      // Fix for the CustomEvent type error
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
    }
  }, [userId]);

  // Fetch application notifications
  useEffect(() => {
    if (userId) {
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
  }, [userId]);

  const selectedRequest = selectedRequestId ? 
    [...activeRequests, ...completedRequests].find(req => req.id === selectedRequestId) : 
    null;

  return {
    activeRequests,
    completedRequests,
    isLoading,
    requestMatches,
    selectedRequestId,
    selectedRequestApplications,
    selectedRequest,
    applicationNotifications,
    isChatOpen,
    chatDeveloperId,
    chatDeveloperName,
    selectedRequestForEdit,
    isEditDialogOpen,
    selectedRequestForCancel,
    isCancelDialogOpen,
    selectedRequestForHistory,
    isHistoryDialogOpen,
    handleViewRequest,
    handleCreateRequest,
    handleEditRequest,
    handleCancelRequest,
    handleViewHistory,
    handleOpenChat,
    handleApplicationUpdate,
    getApplicationCountForRequest,
    getTotalNewApplicationsCount,
    setSelectedRequestId,
    setIsChatOpen,
    setIsEditDialogOpen,
    setIsCancelDialogOpen,
    setIsHistoryDialogOpen,
    fetchHelpRequests,
  };
};
