
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { Loader2, ExternalLink, Clock, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'matching': 'bg-blue-100 text-blue-800',
  'scheduled': 'bg-purple-100 text-purple-800',
  'in-progress': 'bg-green-100 text-green-800',
  'completed': 'bg-gray-100 text-gray-800',
  'cancelled': 'bg-red-100 text-red-800'
};

const statusIcons = {
  'pending': <Clock className="h-4 w-4" />,
  'matching': <Loader2 className="h-4 w-4" />,
  'scheduled': <Calendar className="h-4 w-4" />,
  'in-progress': <Loader2 className="h-4 w-4 animate-spin" />,
  'completed': <CheckCircle2 className="h-4 w-4" />,
  'cancelled': <AlertCircle className="h-4 w-4" />
};

const HelpRequestsTracking: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHelpRequests = async () => {
      if (!userId) {
        console.error('No user ID found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching help requests for user:', userId);
        const { data, error } = await supabase
          .from('help_requests')
          .select('*')
          .eq('client_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching help requests:', error);
          toast.error('Failed to load your help requests');
          setIsLoading(false);
          return;
        }

        console.log('Help requests data:', data);
        setHelpRequests(data || []);
      } catch (error) {
        console.error('Exception fetching help requests:', error);
        toast.error('An unexpected error occurred');
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
                  <span>{request.status}</span>
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
    </div>
  );
};

export default HelpRequestsTracking;
