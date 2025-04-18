import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getHelpRequest, updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { 
  Clock, 
  Edit, 
  AlertCircle, 
  ClipboardList, 
  Calendar, 
  DollarSign, 
  ClipboardCheck, 
  UserCheck, 
  ThumbsUp, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import CancelHelpRequestDialog from './CancelHelpRequestDialog';
import HelpRequestHistoryDialog from './HelpRequestHistoryDialog';
import ClientReviewDialog from './ClientReviewDialog';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';

const HelpRequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { userId, userType } = useAuth();
  
  const [helpRequest, setHelpRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  useEffect(() => {
    if (!requestId) return;
    
    const channel = supabase
      .channel(`request-updates-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'help_requests',
          filter: `id=eq.${requestId}`
        },
        (payload) => {
          console.log('Help request updated:', payload);
          fetchHelpRequest(requestId);
          
          if (payload.new && payload.old && payload.new.status !== payload.old.status) {
            const newStatus = payload.new.status;
            
            let message = '';
            let description = '';
            
            switch(newStatus) {
              case 'in-progress':
                message = 'Developer is working on your request';
                description = 'The developer has started work on your ticket';
                break;
              case 'developer-qa':
                message = 'Developer is reviewing their work';
                description = 'The developer has completed work and is reviewing it';
                break;
              case 'client-review':
                message = 'Your review is needed';
                description = 'The developer has completed work and awaits your review';
                toast.info(message, { description });
                break;
            }
            
            if (message) {
              toast.info(message, { description });
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);
  
  const fetchHelpRequest = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await getHelpRequest(id);
      
      if (response.success && response.data) {
        setHelpRequest(response.data);
      } else {
        toast.error('Could not find the requested help ticket');
        navigate('/get-help/tracking');
      }
    } catch (error) {
      console.error('Error fetching help request:', error);
      toast.error('An error occurred while fetching the help request details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelRequest = () => {
    setShowCancelDialog(true);
  };
  
  const handleViewHistory = () => {
    setShowHistoryDialog(true);
  };
  
  const handleEditRequest = () => {
    toast.info('Edit functionality will be implemented soon');
  };
  
  const handleReviewWork = () => {
    setShowReviewDialog(true);
  };
  
  const handleCompleteRequest = async () => {
    if (!helpRequest || !requestId) return;
    
    try {
      const { success, error } = await updateHelpRequest(requestId, {
        status: 'completed'
      });
      
      if (!success) {
        toast.error('Failed to complete the request');
        return;
      }
      
      toast.success('Request marked as completed!');
      fetchHelpRequest(requestId);
    } catch (error) {
      console.error('Error completing request:', error);
      toast.error('An error occurred');
    }
  };
  
  const handleApproveWork = async () => {
    if (!helpRequest || !requestId) return;
    
    try {
      const { success, error } = await updateHelpRequest(requestId, {
        status: 'client-approved'
      });
      
      if (!success) {
        toast.error('Failed to approve the work');
        return;
      }
      
      toast.success('Work approved! The request will be marked as completed soon.');
      fetchHelpRequest(requestId);
    } catch (error) {
      console.error('Error approving work:', error);
      toast.error('An error occurred');
    }
  };
  
  const handleRequestCancelled = () => {
    fetchHelpRequest(requestId!);
  };
  
  const handleReviewSubmitted = () => {
    fetchHelpRequest(requestId!);
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'open': return <Clock className="h-5 w-5" />;
      case 'claimed': return <AlertCircle className="h-5 w-5" />;
      case 'in-progress': return <Clock className="h-5 w-5 animate-spin" />;
      case 'developer-qa': return <ClipboardCheck className="h-5 w-5 text-indigo-600" />;
      case 'client-review': return <UserCheck className="h-5 w-5 text-orange-600" />;
      case 'client-approved': return <ThumbsUp className="h-5 w-5 text-emerald-600" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (!helpRequest) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Help Request Not Found</h2>
        <p className="text-muted-foreground mb-6">The help request you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/get-help/tracking')}>Back to Tracking</Button>
      </div>
    );
  }
  
  const canCancel = ['open', 'pending', 'matching'].includes(helpRequest.status);
  const canEdit = ['open', 'pending', 'matching'].includes(helpRequest.status);
  const canReview = helpRequest.status === 'client-review' && userType === 'client';
  const canApprove = helpRequest.status === 'client-review' && userType === 'client';
  const canComplete = helpRequest.status === 'client-approved' && (userType === 'client' || userType === 'admin' as string);
  const isCancelled = helpRequest.status === 'cancelled';
  const isCompleted = helpRequest.status === 'completed';
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{helpRequest.title}</CardTitle>
              <CardDescription>
                Ticket #{helpRequest.ticket_number} · Created {new Date(helpRequest.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <Badge 
                className={`
                  px-3 py-1 text-sm flex items-center gap-1
                  ${helpRequest.status === 'open' ? 'bg-blue-500' : ''}
                  ${helpRequest.status === 'pending' ? 'bg-yellow-500' : ''}
                  ${helpRequest.status === 'matching' ? 'bg-purple-500' : ''}
                  ${helpRequest.status === 'in-progress' ? 'bg-green-500' : ''}
                  ${helpRequest.status === 'developer-qa' ? 'bg-indigo-500' : ''}
                  ${helpRequest.status === 'client-review' ? 'bg-orange-500' : ''}
                  ${helpRequest.status === 'client-approved' ? 'bg-emerald-500' : ''}
                  ${helpRequest.status === 'completed' ? 'bg-green-700' : ''}
                  ${helpRequest.status === 'cancelled' ? 'bg-red-500' : ''}
                `}
              >
                {getStatusIcon(helpRequest.status)}
                {helpRequest.status?.charAt(0).toUpperCase() + helpRequest.status?.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{helpRequest.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Technical Areas</h3>
              <div className="flex flex-wrap gap-2">
                {helpRequest.technical_area?.map((area: string) => (
                  <Badge key={area} variant="outline">{area}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Communication Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {helpRequest.communication_preference?.map((pref: string) => (
                  <Badge key={pref} variant="outline">{pref}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Estimated Duration</p>
                <p className="text-sm text-muted-foreground">
                  {helpRequest.estimated_duration} {helpRequest.estimated_duration === 1 ? 'hour' : 'hours'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Budget Range</p>
                <p className="text-sm text-muted-foreground">{helpRequest.budget_range}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Updated</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(helpRequest.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          {helpRequest.code_snippet && (
            <div>
              <h3 className="text-lg font-medium mb-2">Code Snippet</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                <code>{helpRequest.code_snippet}</code>
              </pre>
            </div>
          )}
          
          {/* QA Notes Section */}
          {helpRequest.developer_qa_notes && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-900/30 rounded-md p-4">
              <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-400 flex items-center gap-2 mb-2">
                <ClipboardCheck className="h-5 w-5" />
                Developer QA Notes
              </h3>
              <p className="text-indigo-700 dark:text-indigo-300 whitespace-pre-line">{helpRequest.developer_qa_notes}</p>
            </div>
          )}
          
          {/* Client Feedback Section */}
          {helpRequest.client_feedback && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30 rounded-md p-4">
              <h3 className="text-lg font-medium text-orange-800 dark:text-orange-400 flex items-center gap-2 mb-2">
                <UserCheck className="h-5 w-5" />
                Client Feedback
              </h3>
              <p className="text-orange-700 dark:text-orange-300 whitespace-pre-line">{helpRequest.client_feedback}</p>
            </div>
          )}
          
          {isCancelled && helpRequest.cancellation_reason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-md p-4">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-400 flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5" />
                Cancellation Reason
              </h3>
              <p className="text-red-700 dark:text-red-300">{helpRequest.cancellation_reason}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleViewHistory}
            className="gap-2"
          >
            <ClipboardList className="h-4 w-4" />
            View History
          </Button>
          
          <div className="space-x-2">
            {!isCancelled && !isCompleted && canEdit && (
              <Button 
                variant="outline" 
                onClick={handleEditRequest}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            
            {canReview && (
              <Button 
                variant="default" 
                onClick={handleReviewWork}
                className="gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Review Work
              </Button>
            )}
            
            {canApprove && (
              <Button 
                variant="default" 
                onClick={handleApproveWork}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <ThumbsUp className="h-4 w-4" />
                Approve Work
              </Button>
            )}
            
            {canComplete && (
              <Button 
                variant="default" 
                onClick={handleCompleteRequest}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Complete Request
              </Button>
            )}
            
            {canCancel && (
              <Button 
                variant="destructive" 
                onClick={handleCancelRequest}
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Cancel Request
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      <CancelHelpRequestDialog 
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        requestId={requestId || ''}
        requestTitle={helpRequest.title}
        onRequestCancelled={handleRequestCancelled}
      />
      
      <HelpRequestHistoryDialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        requestId={requestId || ''}
        requestTitle={helpRequest.title}
      />
      
      <ClientReviewDialog 
        isOpen={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        requestId={requestId || ''}
        requestTitle={helpRequest.title}
        developerQANotes={helpRequest.developer_qa_notes}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default HelpRequestDetail;
