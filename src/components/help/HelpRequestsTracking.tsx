
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { Loader2, ExternalLink, Clock, AlertCircle, CheckCircle2, Calendar, FileEdit, Play, PauseCircle, UserCheck2, Check } from 'lucide-react';
import DebugHelpRequestDatabase from './DebugHelpRequestDatabase';

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
  'requirements': <FileEdit className="h-4 w-4" />,
  'todo': <Clock className="h-4 w-4" />,
  'in-progress-unpaid': <Play className="h-4 w-4" />,
  'in-progress-paid': <Play className="h-4 w-4 text-green-600" />,
  'client-review': <UserCheck2 className="h-4 w-4" />,
  'production': <PauseCircle className="h-4 w-4" />,
  'completed': <Check className="h-4 w-4" />,
  'cancelled': <AlertCircle className="h-4 w-4" />,
  'pending': <Clock className="h-4 w-4" />,
  'matching': <Loader2 className="h-4 w-4" />,
  'scheduled': <Calendar className="h-4 w-4" />,
  'in-progress': <Loader2 className="h-4 w-4 animate-spin" />
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

const HelpRequestsTracking: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  useEffect(() => {
    const fetchHelpRequests = async () => {
      if (!userId) {
        console.error('No user ID found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching help requests for user:', userId);
        
        const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        const userLocalHelpRequests = localHelpRequests.filter((req: HelpRequest) => req.client_id === userId);
        console.log('Local help requests for user:', userLocalHelpRequests);
        
        const isLocalAuth = userId.startsWith('client-');
        const isValidUserUUID = isValidUUID(userId);
        
        if (isLocalAuth || !isValidUserUUID) {
          setHelpRequests(userLocalHelpRequests);
          setIsLoading(false);
          return;
        }
        
        try {
          console.log('Fetching from Supabase with user ID:', userId);
          
          // Debug: Get session to verify authentication
          const { data: sessionData } = await supabase.auth.getSession();
          console.log('Current session:', sessionData);
          
          const { data, error } = await supabase
            .from('help_requests')
            .select('*')
            .eq('client_id', userId);

          if (error) {
            console.error('Error fetching help requests from Supabase:', error);
            setError('Failed to load help requests from database');
            setHelpRequests(userLocalHelpRequests);
          } else {
            console.log('Help requests data from Supabase:', data);
            const combinedRequests = [...(data || []), ...userLocalHelpRequests];
            
            const uniqueRequests = combinedRequests.reduce((acc: HelpRequest[], current: HelpRequest) => {
              const existingIndex = acc.findIndex((item: HelpRequest) => item.id === current.id);
              if (existingIndex === -1) {
                acc.push(current);
              }
              return acc;
            }, []);
            
            uniqueRequests.sort((a: HelpRequest, b: HelpRequest) => {
              const dateA = new Date(a.created_at || '').getTime();
              const dateB = new Date(b.created_at || '').getTime();
              return dateB - dateA;
            });
            
            setHelpRequests(uniqueRequests);
          }
        } catch (supabaseError) {
          console.error('Exception fetching from Supabase:', supabaseError);
          setError('Failed to connect to database, showing local requests only');
          setHelpRequests(userLocalHelpRequests);
        }
      } catch (error) {
        console.error('Exception fetching help requests:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHelpRequests();
  }, [userId]);

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

  const handleViewDetails = (requestId: string) => {
    navigate(`/get-help/request/${requestId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Help Requests</h2>
        <button
          onClick={() => navigate('/get-help')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Create New Request
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
          <p>Showing available requests from local storage.</p>
        </div>
      )}

      {helpRequests.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border/40 text-center">
          <h3 className="text-lg font-medium mb-2">No help requests yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't submitted any help requests. Create one to get assistance from our developers.
          </p>
          <button
            onClick={() => navigate('/get-help')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {helpRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white p-6 rounded-xl border border-border/40 hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => request.id && handleViewDetails(request.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{request.title}</h3>
                <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${statusColors[request.status || 'pending']}`}>
                  {statusIcons[request.status || 'pending']}
                  <span>{statusLabels[request.status || 'pending']}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground line-clamp-2 mb-3">{request.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Technical Area:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {request.technical_area.slice(0, 2).map((area, i) => (
                      <span key={i} className="bg-secondary/50 px-2 py-0.5 rounded text-xs">
                        {area}
                      </span>
                    ))}
                    {request.technical_area.length > 2 && (
                      <span className="bg-secondary/50 px-2 py-0.5 rounded text-xs">
                        +{request.technical_area.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget:</span>
                  <p>{request.budget_range}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p>{request.created_at ? formatDate(request.created_at) : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    request.id && handleViewDetails(request.id);
                  }}
                  className="text-primary flex items-center gap-1 text-sm hover:underline"
                >
                  View Details <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <DebugHelpRequestDatabase />
    </div>
  );
};

export default HelpRequestsTracking;
