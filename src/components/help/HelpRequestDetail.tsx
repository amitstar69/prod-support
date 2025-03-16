
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Clock, Calendar, Hourglass, Wallet, MessageSquare, FileEdit, Play, UserCheck2, PauseCircle, Check, AlertCircle } from 'lucide-react';

const statusColors = {
  'requirements': 'bg-purple-100 text-purple-800',
  'todo': 'bg-blue-100 text-blue-800',
  'in-progress-unpaid': 'bg-yellow-100 text-yellow-800',
  'in-progress-paid': 'bg-green-100 text-green-800',
  'client-review': 'bg-orange-100 text-orange-800',
  'production': 'bg-pink-100 text-pink-800',
  'completed': 'bg-gray-100 text-gray-800',
  'cancelled': 'bg-red-100 text-red-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'matching': 'bg-blue-100 text-blue-800',
  'scheduled': 'bg-purple-100 text-purple-800',
  'in-progress': 'bg-green-100 text-green-800'
};

const statusIcons = {
  'requirements': <FileEdit className="h-5 w-5" />,
  'todo': <Clock className="h-5 w-5" />,
  'in-progress-unpaid': <Play className="h-5 w-5" />,
  'in-progress-paid': <Play className="h-5 w-5 text-green-600" />,
  'client-review': <UserCheck2 className="h-5 w-5" />,
  'production': <PauseCircle className="h-5 w-5" />,
  'completed': <Check className="h-5 w-5" />,
  'cancelled': <AlertCircle className="h-5 w-5" />,
  'pending': <Clock className="h-5 w-5" />,
  'matching': <Loader2 className="h-5 w-5" />,
  'scheduled': <Calendar className="h-5 w-5" />,
  'in-progress': <Loader2 className="h-5 w-5 animate-spin" />
};

const statusLabels = {
  'requirements': 'Requirements',
  'todo': 'To Do',
  'in-progress-unpaid': 'In Progress (Unpaid)',
  'in-progress-paid': 'In Progress (Paid)',
  'client-review': 'Client Review',
  'production': 'In Production',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'pending': 'Pending',
  'matching': 'Matching',
  'scheduled': 'Scheduled',
  'in-progress': 'In Progress'
};

const workflowSteps = [
  { id: 'requirements', label: 'Requirements' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress-unpaid', label: 'In Progress (Unpaid)' },
  { id: 'in-progress-paid', label: 'In Progress (Paid)' },
  { id: 'client-review', label: 'Client Review' },
  { id: 'production', label: 'In Production' },
  { id: 'completed', label: 'Completed' }
];

const HelpRequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState([]);

  // Function to validate UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Function to fetch applications for this request
  const fetchApplications = async () => {
    if (!requestId || !userId) return;
    
    try {
      console.log('Fetching applications for request:', requestId);
      
      // Check for applications in localStorage
      const localApplications = JSON.parse(localStorage.getItem('help_request_matches') || '[]');
      const localMatches = localApplications.filter((app: any) => app.request_id === requestId);
      
      if (localMatches.length > 0) {
        console.log('Found applications in local storage:', localMatches);
        setApplications(localMatches);
        return;
      }
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('help_request_matches')
        .select('*, developers:developer_id(id, profiles(name, image, description))')
        .eq('request_id', requestId);
      
      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }
      
      console.log('Applications from database:', data);
      setApplications(data || []);
    } catch (error) {
      console.error('Exception fetching applications:', error);
    }
  };

  useEffect(() => {
    const fetchHelpRequest = async () => {
      if (!userId || !requestId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching help request details for:', requestId);
        
        // Check for help request in localStorage
        const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        const localRequest = localHelpRequests.find((req: HelpRequest) => 
          req.id === requestId && req.client_id === userId
        );
        
        if (localRequest) {
          console.log('Found request in local storage:', localRequest);
          setRequest(localRequest);
          setIsLoading(false);
          return;
        }
        
        // If not found in localStorage and the user ID is not a valid UUID, show error
        const isValidUserUUID = isValidUUID(userId);
        if (!isValidUserUUID) {
          console.error('Invalid UUID format for Supabase query:', userId);
          setError('Help request not found');
          setIsLoading(false);
          return;
        }
        
        // Try to fetch from Supabase if not found locally and userId is valid UUID
        try {
          const { data, error } = await supabase
            .from('help_requests')
            .select('*')
            .eq('id', requestId)
            .eq('client_id', userId)
            .single();

          if (error) {
            console.error('Error fetching help request details from Supabase:', error);
            setError('Help request not found in database');
            setIsLoading(false);
            return;
          }

          console.log('Help request detail data from Supabase:', data);
          setRequest(data);
        } catch (supabaseError) {
          console.error('Exception fetching from Supabase:', supabaseError);
          setError('Error connecting to database');
        }
      } catch (error) {
        console.error('Exception fetching help request details:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHelpRequest();
  }, [userId, requestId, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    
    console.log('Setting up notification subscription for help request:', requestId);
    
    const channel = supabase
      .channel('help_request_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          toast.success(payload.new.title, {
            description: payload.new.message,
          });
          // Refresh applications or request data as needed
          fetchApplications();
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });
      
    // Load initial applications data
    fetchApplications();
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, userId, requestId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-border/40 text-center">
        <h3 className="text-lg font-medium mb-2">Help request not found</h3>
        <p className="text-muted-foreground mb-4">
          {error || "The help request you're looking for doesn't exist or you don't have permission to view it."}
        </p>
        <button
          onClick={() => navigate('/get-help/tracking')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Back to All Requests
        </button>
      </div>
    );
  }

  // Get current status index
  const currentStepIndex = workflowSteps.findIndex(step => step.id === request.status);
  const normalizedStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/get-help/tracking')}
        className="flex items-center text-sm mb-6 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to All Requests
      </button>

      <div className="bg-white p-8 rounded-xl border border-border/40">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-semibold">{request.title}</h2>
          <div className={`px-4 py-1 rounded-full text-sm font-medium ${statusColors[request.status || 'pending']}`}>
            {statusIcons[request.status || 'pending']}
            <span className="ml-1">{statusLabels[request.status || 'pending']}</span>
          </div>
        </div>

        {/* Workflow Status Bar */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Request Status</h3>
          <div className="relative">
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max">
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className="flex-1 relative">
                    <div className={`flex items-center justify-center ${index <= normalizedStepIndex ? 'text-primary' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${index <= normalizedStepIndex ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="text-xs text-center mt-2">{step.label}</div>
                    {index < workflowSteps.length - 1 && (
                      <div className={`absolute top-4 left-1/2 w-full h-0.5 ${index < normalizedStepIndex ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-medium mb-3">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">{request.description}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Request Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-muted-foreground">{request.created_at ? formatDate(request.created_at) : 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Hourglass className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Duration & Urgency</p>
                    <p className="text-muted-foreground">
                      {request.estimated_duration} minutes • {request.urgency} priority
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Budget</p>
                    <p className="text-muted-foreground">{request.budget_range}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Communication</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.communication_preference.map((pref, i) => (
                        <span key={i} className="bg-secondary/50 px-2 py-0.5 rounded text-xs">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Technical Details</h3>
          
          <div>
            <p className="font-medium mb-1">Technical Areas</p>
            <div className="flex flex-wrap gap-1">
              {request.technical_area.map((area, i) => (
                <span key={i} className="bg-secondary/50 px-2 py-1 rounded text-sm">
                  {area}
                </span>
              ))}
            </div>
          </div>
          
          {request.code_snippet && (
            <div>
              <p className="font-medium mb-1">Code Snippet</p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre>{request.code_snippet}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpRequestDetail;
