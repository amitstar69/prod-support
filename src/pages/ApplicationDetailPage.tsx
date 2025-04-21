
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/auth';
import { HelpRequestMatch, ApplicationStatus } from '../types/helpRequest';
import { toast } from 'sonner';
import { updateApplicationStatus, VALID_MATCH_STATUSES } from '../integrations/supabase/helpRequestsApplications';
import { 
  ArrowLeft, 
  MessageCircle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  User
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import ChatDialog from '../components/chat/ChatDialog';
import Layout from '../components/Layout';

const ApplicationDetailPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState<any | null>(null);
  const [developer, setDeveloper] = useState<any | null>(null);
  const [helpRequest, setHelpRequest] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !userId || !applicationId) {
      navigate('/login');
      return;
    }
    
    fetchApplicationDetails();
  }, [applicationId, userId, isAuthenticated]);

  const fetchApplicationDetails = async () => {
    if (!applicationId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch the application with developer profile
      const { data: applicationData, error: applicationError } = await supabase
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
        .eq('id', applicationId)
        .single();
        
      if (applicationError) {
        console.error('Error fetching application:', applicationError);
        toast.error('Failed to load application details');
        return;
      }
      
      setApplication(applicationData);
      setDeveloper(applicationData.developer);
      
      // Fetch the help request
      const { data: requestData, error: requestError } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', applicationData.request_id)
        .single();
        
      if (requestError) {
        console.error('Error fetching help request:', requestError);
        toast.error('Failed to load ticket details');
        return;
      }
      
      // Verify this client owns the request
      if (requestData.client_id !== userId) {
        toast.error('You do not have permission to view this application');
        navigate('/client/tickets');
        return;
      }
      
      setHelpRequest(requestData);
      
    } catch (error) {
      console.error('Exception fetching application details:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptApplication = async () => {
    if (!applicationId || !userId || !helpRequest) return;
    
    try {
      setProcessing(true);
      toast.loading('Processing application approval...');
      
      const result = await updateApplicationStatus(
        applicationId,
        VALID_MATCH_STATUSES.APPROVED as ApplicationStatus,
        userId
      );
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('Application approved successfully!');
        
        // Navigate to the ticket detail view
        navigate(`/client/tickets/${helpRequest.id}`);
      } else {
        toast.error(`Failed to approve application: ${result.error}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An error occurred while approving the application');
      console.error('Error approving application:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleRejectApplication = async () => {
    if (!applicationId || !userId) return;
    
    try {
      setProcessing(true);
      toast.loading('Rejecting application...');
      
      const result = await updateApplicationStatus(
        applicationId,
        VALID_MATCH_STATUSES.REJECTED as ApplicationStatus,
        userId
      );
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('Application rejected successfully');
        navigate('/client/tickets');
      } else {
        toast.error(`Failed to reject application: ${result.error}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An error occurred while rejecting the application');
      console.error('Error rejecting application:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleOpenChat = () => {
    setIsChatOpen(true);
  };
  
  const formatCurrency = (value: number) => {
    return `$${value}`;
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">Loading application details...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!application || !helpRequest) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The application you're looking for doesn't exist or you don't have permission to view it.
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
          
          <h1 className="text-2xl font-bold mb-1">Developer Application</h1>
          <p className="text-muted-foreground text-sm">
            Review application for ticket: {helpRequest.title}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Application details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Developer info */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={developer?.image || '/placeholder.svg'} alt={developer?.name || 'Developer'} />
                    <AvatarFallback>{developer?.name?.charAt(0) || 'D'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{developer?.name || 'Developer'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {developer?.location || 'Location not specified'}
                    </p>
                  </div>
                </div>
                
                {/* Message */}
                {application.proposed_message && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Developer's Message:</h4>
                    <p className="text-sm">{application.proposed_message}</p>
                  </div>
                )}
                
                {/* Proposed details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Estimated Duration
                    </div>
                    <p className="font-medium">{application.proposed_duration} minutes</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Hourly Rate
                    </div>
                    <p className="font-medium">{formatCurrency(application.proposed_rate)}/hr</p>
                  </div>
                </div>
                
                {/* Total cost estimate */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Estimated Total Cost:</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(Math.round(application.proposed_rate * (application.proposed_duration / 60)))}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {application.proposed_duration} minutes at {formatCurrency(application.proposed_rate)}/hour
                  </p>
                </div>
                
                {/* Application status */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge 
                    variant="outline"
                    className={`
                      ${application.status === 'approved' ? 'bg-green-50 text-green-800 border-green-200' : 
                      application.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' :
                      'bg-blue-50 text-blue-800 border-blue-200'}
                    `}
                  >
                    {application.status}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                {application.status === 'pending' ? (
                  <div className="flex flex-col sm:flex-row w-full gap-3">
                    <Button 
                      className="flex-1" 
                      onClick={handleAcceptApplication}
                      disabled={processing}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept Application
                    </Button>
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={handleRejectApplication}
                      disabled={processing}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                ) : (
                  <div className="w-full text-center text-sm text-muted-foreground">
                    This application has already been {application.status}.
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
          
          {/* Right column: Actions and ticket info */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={handleOpenChat}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Developer
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => navigate(`/client/tickets/${helpRequest.id}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Full Ticket
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => navigate(`/developer-profiles/${developer?.id}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Developer Profile
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{helpRequest.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{helpRequest.description}</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge 
                      variant="outline"
                      className="mt-1"
                    >
                      {helpRequest.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="mt-1 font-medium">{helpRequest.budget_range}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Technical Areas</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {helpRequest.technical_area.map((area: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Chat dialog */}
      {application && (
        <ChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          helpRequestId={application.request_id}
          otherId={application.developer_id}
          otherName={developer?.name || 'Developer'}
        />
      )}
    </Layout>
  );
};

export default ApplicationDetailPage;
