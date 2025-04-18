
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HelpRequest, HelpRequestHistoryItem } from '../../types/helpRequest';
import { getHelpRequest, getHelpRequestHistory } from '../../integrations/supabase/helpRequests';
import { formatDistanceToNow, format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import ChatInterface from '../chat/ChatInterface';
import { 
  AlertCircle, 
  Clock, 
  ArrowLeft, 
  MessageCircle, 
  ClipboardCheck, 
  UserCheck,
  History,
  Edit,
  CheckCircle2,
  Send,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';
import HelpRequestHistoryDialog from '../help/HelpRequestHistoryDialog';
import ClientReviewDialog from '../help/ClientReviewDialog';

const ClientTicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('details');
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  // Load ticket data
  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) return;
      
      setIsLoading(true);
      try {
        const response = await getHelpRequest(ticketId);
        if (response.success && response.data) {
          setTicket(response.data);
        } else {
          setError(response.error || 'Failed to load ticket details');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTicket();
  }, [ticketId]);

  const getStatusBadge = (status?: string) => {
    switch(status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending</Badge>;
      case 'matching':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Matching</Badge>;
      case 'claimed':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Claimed</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">In Progress</Badge>;
      case 'developer-qa':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Developer QA</Badge>;
      case 'client-review':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Review Required</Badge>;
      case 'client-approved':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Approved</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'open':
      case 'pending':
      case 'matching': 
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'claimed':
      case 'in-progress': 
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'developer-qa': 
        return <ClipboardCheck className="h-5 w-5 text-amber-500" />;
      case 'client-review':
      case 'client-approved': 
        return <UserCheck className="h-5 w-5 text-purple-500" />;
      case 'completed':
      case 'resolved': 
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <X className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h2 className="text-lg font-medium text-red-800">
          {error || 'Ticket not found'}
        </h2>
        <p className="text-red-600 mt-1">
          Unable to load the requested ticket. It may have been deleted or you don't have permission to view it.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/client')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  // Determine if we should show the review button based on status
  const showReviewButton = ticket.status === 'client-review';

  const ticketKey = ticket.ticket_number ? 
    `TICKET-${ticket.ticket_number}` : 
    `TICKET-${Math.floor(Math.random() * 900) + 100}`;

  return (
    <>
      <div className="space-y-6">
        {/* Header with navigation and controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/client')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-muted-foreground">{ticketKey}</span>
                {getStatusBadge(ticket.status)}
              </div>
              <h1 className="text-xl font-bold">{ticket.title}</h1>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHistoryDialog(true)}
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
            
            {showReviewButton && (
              <Button 
                size="sm"
                onClick={() => setShowReviewDialog(true)}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Submit Review
              </Button>
            )}
          </div>
        </div>
        
        {/* Tab navigation */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Main ticket details */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Description</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                    
                    {ticket.code_snippet && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Code Snippet</h4>
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                          {ticket.code_snippet}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Developer Notes (if available) */}
                {ticket.developer_qa_notes && (
                  <Card className="border-amber-200">
                    <CardHeader className="bg-amber-50">
                      <div className="flex items-center">
                        <ClipboardCheck className="h-4 w-4 text-amber-500 mr-2" />
                        <CardTitle className="text-base">Developer Notes</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="whitespace-pre-wrap">{ticket.developer_qa_notes}</p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Client Feedback (if available) */}
                {ticket.client_feedback && (
                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50">
                      <div className="flex items-center">
                        <UserCheck className="h-4 w-4 text-purple-500 mr-2" />
                        <CardTitle className="text-base">Your Feedback</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="whitespace-pre-wrap">{ticket.client_feedback}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Right column - Metadata and quick actions */}
              <div className="space-y-6">
                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span className="font-medium">{ticket.status}</span>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created:</span>{" "}
                        {ticket.created_at ? 
                          format(new Date(ticket.created_at), 'PPpp') : 'N/A'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>{" "}
                        {ticket.updated_at ? 
                          formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true }) : 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Technical Areas */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Technical Areas</h4>
                      <div className="flex flex-wrap gap-1">
                        {ticket.technical_area?.map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {(!ticket.technical_area || ticket.technical_area.length === 0) && (
                          <span className="text-sm text-muted-foreground">None specified</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Urgency */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Urgency</h4>
                      <div className="flex items-center">
                        <Badge variant={ticket.urgency === 'high' ? 'destructive' : 
                                       ticket.urgency === 'medium' ? 'default' : 'outline'}>
                          {ticket.urgency || 'Low'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Budget */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Budget Range</h4>
                      <span>{ticket.budget_range || 'Not specified'}</span>
                    </div>
                    
                    {/* Duration */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Estimated Duration</h4>
                      <span>{ticket.estimated_duration} minutes</span>
                    </div>
                    
                    {/* Communication */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Communication</h4>
                      <div className="flex flex-wrap gap-1">
                        {ticket.communication_preference?.map((pref, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {pref}
                          </Badge>
                        ))}
                        {(!ticket.communication_preference || ticket.communication_preference.length === 0) && (
                          <span className="text-sm text-muted-foreground">None specified</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Messages Tab */}
          <TabsContent value="messages" className="h-[70vh] pt-4">
            {ticket.id && ticket.client_id && (
              <div className="h-full border rounded-md overflow-hidden">
                <ChatInterface 
                  helpRequestId={ticket.id} 
                  otherId={ticket.client_id} 
                  otherName="Developer"
                />
              </div>
            )}
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketTimeline ticketId={ticket.id || ''} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* History Dialog */}
      <HelpRequestHistoryDialog 
        helpRequestId={ticket.id || ''}
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
      />
      
      {/* Review Dialog */}
      {ticket.id && (
        <ClientReviewDialog
          isOpen={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          helpRequest={ticket}
          onReviewSubmitted={() => {
            // Refresh ticket data after review
            getHelpRequest(ticket.id || '').then(response => {
              if (response.success && response.data) {
                setTicket(response.data);
              }
            });
          }}
        />
      )}
    </>
  );
};

// Timeline component to show ticket activity
const TicketTimeline: React.FC<{ticketId: string}> = ({ ticketId }) => {
  const [history, setHistory] = useState<HelpRequestHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchHistory = async () => {
      if (!ticketId) return;
      
      setIsLoading(true);
      try {
        const response = await getHelpRequestHistory(ticketId);
        if (response.success && response.data) {
          setHistory(response.data);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [ticketId]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity recorded yet.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {history.map((item, index) => {
        let icon;
        let title;
        
        switch (item.change_type) {
          case 'STATUS_CHANGE':
            icon = <Clock className="h-4 w-4" />;
            title = `Status changed from ${item.previous_status || 'none'} to ${item.new_status}`;
            break;
          case 'EDIT':
            icon = <Edit className="h-4 w-4" />;
            title = 'Ticket was edited';
            break;
          case 'CANCELLED':
            icon = <X className="h-4 w-4" />;
            title = 'Ticket was cancelled';
            break;
          case 'DEVELOPER_QA':
            icon = <ClipboardCheck className="h-4 w-4" />;
            title = 'Developer submitted QA notes';
            break;
          case 'CLIENT_FEEDBACK':
            icon = <MessageCircle className="h-4 w-4" />;
            title = 'Client provided feedback';
            break;
          default:
            icon = <History className="h-4 w-4" />;
            title = `${item.change_type || 'Update'}`;
        }
        
        return (
          <div key={item.id} className="flex gap-4">
            <div className="mt-1 bg-muted rounded-full p-1.5">
              {icon}
            </div>
            <div className="flex-1">
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">
                {item.changed_at ? format(new Date(item.changed_at), 'PPpp') : 'Unknown date'}
              </p>
              
              {/* Show details of what changed if available */}
              {item.change_details && (
                <div className="mt-2 text-sm">
                  {item.change_details.title_changed && <div>• Title was updated</div>}
                  {item.change_details.description_changed && <div>• Description was modified</div>}
                  {item.change_details.technical_area_changed && <div>• Technical areas were updated</div>}
                  {item.change_details.budget_changed && <div>• Budget range was changed</div>}
                  {item.change_details.cancellation_reason && (
                    <div className="mt-1 p-2 border rounded bg-muted/40">
                      <div className="font-medium">Cancellation reason:</div>
                      <div>{item.change_details.cancellation_reason}</div>
                    </div>
                  )}
                  {item.change_details.developer_qa_notes && (
                    <div className="mt-1 p-2 border rounded bg-muted/40">
                      <div className="font-medium">Developer notes:</div>
                      <div>{item.change_details.developer_qa_notes}</div>
                    </div>
                  )}
                  {item.change_details.client_feedback && (
                    <div className="mt-1 p-2 border rounded bg-muted/40">
                      <div className="font-medium">Client feedback:</div>
                      <div>{item.change_details.client_feedback}</div>
                    </div>
                  )}
                </div>
              )}
              
              {index !== history.length - 1 && <Separator className="my-4" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClientTicketDetail;
