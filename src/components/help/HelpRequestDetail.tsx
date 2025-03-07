
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Clock, Calendar, Hourglass, Wallet, MessageSquare } from 'lucide-react';

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'matching': 'bg-blue-100 text-blue-800',
  'scheduled': 'bg-purple-100 text-purple-800',
  'in-progress': 'bg-green-100 text-green-800',
  'completed': 'bg-gray-100 text-gray-800',
  'cancelled': 'bg-red-100 text-red-800'
};

const HelpRequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHelpRequest = async () => {
      if (!userId || !requestId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching help request details for:', requestId);
        const { data, error } = await supabase
          .from('help_requests')
          .select('*')
          .eq('id', requestId)
          .eq('client_id', userId)
          .single();

        if (error) {
          console.error('Error fetching help request details:', error);
          toast.error('Failed to load request details');
          navigate('/get-help/tracking');
          return;
        }

        console.log('Help request detail data:', data);
        setRequest(data);
      } catch (error) {
        console.error('Exception fetching help request details:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHelpRequest();
  }, [userId, requestId, navigate]);

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
          The help request you're looking for doesn't exist or you don't have permission to view it.
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
            {request.status}
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
