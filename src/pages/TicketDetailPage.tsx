
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/auth';
import { HelpRequest, HelpRequestMatch } from '../types/helpRequest';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  MessageCircle, 
  Clock, 
  History,
  FileEdit,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  ClipboardList,
  BarChart3
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ChatDialog from '../components/chat/ChatDialog';
import Layout from '../components/Layout';
import EditHelpRequestForm from '../components/help/EditHelpRequestForm';
import CancelHelpRequestDialog from '../components/help/CancelHelpRequestDialog';
import HelpRequestHistoryDialog from '../components/help/HelpRequestHistoryDialog';
import { getHelpRequest, getHelpRequestHistory } from '../integrations/supabase/helpRequests';
import { formatDistanceToNow } from 'date-fns';

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [assignedDeveloper, setAssignedDeveloper] = useState<any | null>(null);
  const [ticketHistory, setTicketHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialogs
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !userId || !ticketId) {
      navigate('/login');
      return;
    }
    
    fetchTicketDetails();
  }, [ticketId, userId, isAuthenticated]);

  const fetchTicketDetails = async () => {
    if (!ticketId || !userId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch the ticket
      const ticketResponse = await getHelpRequest(ticketId);
      
      if (!ticketResponse.success || !ticketResponse.data) {
        console.error('Error fetching ticket:', ticketResponse.error);
        toast.error('Failed to load ticket details');
        return;
      }
      
      const helpRequest = ticketResponse.data;
      
      // Verify this client owns the ticket
      if (helpRequest.client_id !== userId) {
        toast.error('You do not have permission to view this ticket');
        navigate('/client/tickets');
        return;
      }
      
      setTicket(helpRequest);
      
      // Fetch the assigned developer (approved application)
      const { data: applications, error: applicationsError } = await supabase
        .from('help_request_matches')
        .select(`
          *,
          developer:profiles!help_request_matches_developer_id_fkey (
            id,
            name,
            image,
            description,
            location,
            user_type
          )
        `)
        .eq('request_id', ticketId)
        .eq('status', 'approved')
        .maybeSingle();
        
      if (applicationsError) {
        console.error('Error fetching assigned developer:', applicationsError);
      }
      
      if (applications) {
        setAssignedDeveloper({
          ...applications.developer,
          application: applications
        });
      }
      
      // Fetch ticket history
      const historyResponse = await getHelpRequestHistory(ticketId);
      
      if (historyResponse.success && historyResponse.data) {
        setTicketHistory(historyResponse.data);
      } else {
        console.error('Error fetching ticket history:', historyResponse.error);
      }
      
    } catch (error) {
      console.error('Exception fetching ticket details:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenChat = () => {
    if (!assignedDeveloper) {
      toast.error('No developer is assigned to this ticket');
      return;
    }
    
    setIsChatOpen(true);
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
      case 'developer-qa':
        return <ClipboardList className="h-5 w-5 text-blue-500" />;
      case 'client-review':
        return <ClipboardList className="h-5 w-5 text-orange-500" />;
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
      case 'developer-qa':
        return 'The developer is reviewing the work before submitting for your approval';
      case 'client-review':
        return 'Please review the completed work and provide feedback';
      case 'completed':
        return 'Your request has been successfully completed';
      case 'cancelled':
        return 'This request has been cancelled';
      default:
        return 'Status unknown';
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">Loading ticket details...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!ticket) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The ticket you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/client/tickets')}>
              Return to Tickets
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-secondary/30 py-6">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/client/tickets')}
            className="mb-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{ticket.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-secondary">
                  #{ticket.ticket_number || '000'}
                </Badge>
                <Badge 
                  variant="outline"
                  className={`
                    ${ticket.status === 'in-progress' ? 'bg-green-50 text-green-800 border-green-200' : 
                     ticket.status === 'matching' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                     ticket.status === 'scheduled' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                     ticket.status === 'developer-qa' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                     ticket.status === 'client-review' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                     ticket.status === 'completed' ? 'bg-green-50 text-green-800 border-green-200' :
                     ticket.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                     'bg-yellow-50 text-yellow-800 border-yellow-200'}
                  `}
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon(ticket.status || 'pending')}
                    <span className="ml-1">{ticket.status}</span>
                  </span>
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex gap-2">
              {['pending', 'matching'].includes(ticket.status || '') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsHistoryDialogOpen(true)}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              
              {!['completed', 'cancelled'].includes(ticket.status || '') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Ticket details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">Activity History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ticket Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-1">Description</h3>
                      <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Technical Areas</div>
                        <div className="flex flex-wrap gap-1">
                          {ticket.technical_area.map((area, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Budget Range</div>
                        <div className="font-medium">{ticket.budget_range}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Urgency</div>
                        <div className="font-medium capitalize">{ticket.urgency}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Created</div>
                        <div className="font-medium">{formatDate(ticket.created_at)}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="font-medium">{formatDate(ticket.updated_at)}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-medium">{ticket.estimated_duration} minutes</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Communication Preferences</div>
                      <div className="flex flex-wrap gap-1">
                        {ticket.communication_preference.map((method, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {ticket.code_snippet && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Code Snippet</div>
                          <div className="bg-muted p-4 rounded-md overflow-x-auto">
                            <pre className="text-xs whitespace-pre-wrap">{ticket.code_snippet}</pre>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {ticket.status === 'client-review' && ticket.developer_qa_notes && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Developer Notes</div>
                          <div className="bg-muted p-4 rounded-md">
                            <p className="text-sm whitespace-pre-wrap">{ticket.developer_qa_notes}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ticketHistory.length > 0 ? (
                      <div className="space-y-4">
                        {ticketHistory.map((event, index) => (
                          <div key={event.id} className="bg-muted/30 p-3 rounded-md">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                {event.change_type === 'STATUS_CHANGE' ? (
                                  <>Status changed from <Badge variant="outline" className="text-xs">{event.previous_status}</Badge> to <Badge variant="outline" className="text-xs">{event.new_status}</Badge></>
                                ) : (
                                  event.change_type === 'EDIT' ? 'Ticket updated' : event.change_type
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground">{formatDate(event.changed_at)}</span>
                            </div>
                            
                            {event.change_details && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {event.change_details.title_changed && <div>- Title was updated</div>}
                                {event.change_details.description_changed && <div>- Description was updated</div>}
                                {event.change_details.technical_area_changed && <div>- Technical areas were updated</div>}
                                {event.change_details.budget_changed && <div>- Budget range was updated</div>}
                                {event.change_details.cancellation_reason && (
                                  <div>- Cancellation reason: {event.change_details.cancellation_reason}</div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No activity history available for this ticket.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column: Assigned developer and actions */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(ticket.status || 'pending')}
                  <div>
                    <div className="font-medium">{ticket.status}</div>
                    <div className="text-sm text-muted-foreground">
                      {getStatusDescription(ticket.status || 'pending')}
                    </div>
                  </div>
                </div>
                
                {ticket.status === 'client-review' && (
                  <Button className="w-full">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Work
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {/* Assigned developer card */}
            {assignedDeveloper ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Developer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={assignedDeveloper.image || '/placeholder.svg'} alt={assignedDeveloper.name} />
                      <AvatarFallback>{assignedDeveloper.name?.charAt(0) || 'D'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{assignedDeveloper.name}</div>
                      <div className="text-sm text-muted-foreground">{assignedDeveloper.location || 'Location unknown'}</div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleOpenChat}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Developer
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={() => navigate(`/developer-profiles/${assignedDeveloper.id}`)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Developer Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 text-muted-foreground">
                    No developer is currently assigned to this ticket.
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/client/tickets')}
                  >
                    View Applications
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Actions card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => navigate('/client/tickets')}
                >
                  Back to Tickets
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      {ticket && (
        <>
          <EditHelpRequestForm
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            helpRequest={ticket}
            onRequestUpdated={fetchTicketDetails}
          />
          
          <CancelHelpRequestDialog
            isOpen={isCancelDialogOpen}
            onClose={() => setIsCancelDialogOpen(false)}
            requestId={ticket.id!}
            requestTitle={ticket.title}
            onRequestCancelled={fetchTicketDetails}
          />
          
          <HelpRequestHistoryDialog
            isOpen={isHistoryDialogOpen}
            onClose={() => setIsHistoryDialogOpen(false)}
            requestId={ticket.id!}
            requestTitle={ticket.title}
          />
          
          {assignedDeveloper && (
            <ChatDialog
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              helpRequestId={ticket.id!}
              otherId={assignedDeveloper.id}
              otherName={assignedDeveloper.name || 'Developer'}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default TicketDetailPage;
