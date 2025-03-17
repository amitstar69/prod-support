
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpRequestMatch, ApplicationStatus } from '../../types/helpRequest';
import { updateApplicationStatus } from '../../integrations/supabase/helpRequests';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Clock, Hourglass, DollarSign, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

const APPLICATION_STATUSES = {
  PENDING: 'pending' as ApplicationStatus,
  APPROVED: 'approved' as ApplicationStatus,
  REJECTED: 'rejected' as ApplicationStatus,
  COMPLETED: 'completed' as ApplicationStatus,
  CANCELLED: 'cancelled' as ApplicationStatus
};

interface DeveloperProfile {
  id: string;
  profiles: {
    name: string;
    image: string;
    description: string;
  };
}

interface DeveloperApplicationsProps {
  applications: any[];
  requestId: string;
  clientId: string;
  onApplicationUpdate: () => void;
  onOpenChat: (developerId: string, applicationId: string) => void;
}

const DeveloperApplications: React.FC<DeveloperApplicationsProps> = ({ 
  applications, 
  requestId,
  clientId,
  onApplicationUpdate,
  onOpenChat
}) => {
  const navigate = useNavigate();
  const [processingApplicationIds, setProcessingApplicationIds] = useState<string[]>([]);
  const [approvedApplication, setApprovedApplication] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const handleApprove = async (applicationId: string) => {
    try {
      setProcessingApplicationIds(prev => [...prev, applicationId]);
      toast.loading('Approving application...');
      
      console.log('Approving application with status:', APPLICATION_STATUSES.APPROVED);
      const result = await updateApplicationStatus(applicationId, APPLICATION_STATUSES.APPROVED, clientId);
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('Application approved successfully!');
        
        const approved = applications.find(app => app.id === applicationId);
        if (approved) {
          setApprovedApplication(approved);
          setShowSuccessDialog(true);
        }
        
        onApplicationUpdate();
      } else {
        toast.error(`Failed to approve application: ${result.error}`);
        console.error('Error details:', result);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An error occurred while approving the application');
      console.error('Error approving application:', error);
    } finally {
      setProcessingApplicationIds(prev => prev.filter(id => id !== applicationId));
    }
  };
  
  const handleReject = async (applicationId: string) => {
    try {
      setProcessingApplicationIds(prev => [...prev, applicationId]);
      toast.loading('Rejecting application...');
      
      console.log('Rejecting application with status:', APPLICATION_STATUSES.REJECTED);
      const result = await updateApplicationStatus(applicationId, APPLICATION_STATUSES.REJECTED, clientId);
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('Application rejected successfully.');
        onApplicationUpdate();
      } else {
        toast.error(`Failed to reject application: ${result.error}`);
        console.error('Error details:', result);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An error occurred while rejecting the application');
      console.error('Error rejecting application:', error);
    } finally {
      setProcessingApplicationIds(prev => prev.filter(id => id !== applicationId));
    }
  };
  
  const handleStartChat = (developerId: string, applicationId: string) => {
    onOpenChat(developerId, applicationId);
    setShowSuccessDialog(false);
  };
  
  const formatCurrency = (value: number) => {
    return `$${value}`;
  };

  const getDeveloperName = (application: any) => {
    if (application.developers?.profiles?.name) {
      return application.developers.profiles.name;
    }
    if (application.developer?.profile?.name) {
      return application.developer.profile.name;
    }
    return 'Developer';
  };
  
  const getDeveloperImage = (application: any) => {
    if (application.developers?.profiles?.image) {
      return application.developers.profiles.image;
    }
    if (application.developer?.profile?.image) {
      return application.developer.profile.image;
    }
    return '/placeholder.svg';
  };

  const isProcessing = (applicationId: string) => {
    return processingApplicationIds.includes(applicationId);
  };

  if (applications.length === 0) {
    return (
      <div className="bg-background p-6 rounded-lg border border-border/40 text-center">
        <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">👨‍💻</div>
        <h3 className="text-xl font-medium mb-2">No developer applications yet</h3>
        <p className="text-muted-foreground mb-4">
          When developers apply to your request, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((application) => (
          <Card key={application.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={getDeveloperImage(application)} alt={getDeveloperName(application)} />
                    <AvatarFallback>{getDeveloperName(application).charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{getDeveloperName(application)}</CardTitle>
                </div>
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
            </CardHeader>
            
            <CardContent className="space-y-3">
              {application.proposed_message && (
                <div className="bg-muted p-3 rounded text-sm">
                  <p>{application.proposed_message}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Hourglass className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {application.proposed_duration} minutes
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatCurrency(application.proposed_rate)}/hr
                  </span>
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded">
                <div className="flex justify-between items-center text-sm">
                  <span>Estimated total cost:</span>
                  <span className="font-medium">
                    {formatCurrency(Math.round(application.proposed_rate * (application.proposed_duration / 60)))}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {application.proposed_duration} minutes at {formatCurrency(application.proposed_rate)}/hour
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="gap-3 flex flex-wrap">
              {application.status === 'pending' && (
                <>
                  <Button 
                    className="flex-1"
                    onClick={() => handleApprove(application.id)}
                    disabled={isProcessing(application.id)}
                  >
                    {isProcessing(application.id) ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">◌</span>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button 
                    className="flex-1"
                    variant="outline"
                    onClick={() => handleReject(application.id)}
                    disabled={isProcessing(application.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              
              <Button 
                className={application.status === 'pending' ? 'w-full mt-2' : 'flex-1'}
                variant={application.status === 'pending' ? 'outline' : 'default'}
                onClick={() => onOpenChat(application.developer_id, application.id)}
                disabled={isProcessing(application.id)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
              Application Approved!
            </DialogTitle>
            <DialogDescription>
              You've approved a developer to work on your request.
            </DialogDescription>
          </DialogHeader>
          
          {approvedApplication && (
            <div className="space-y-4 my-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={getDeveloperImage(approvedApplication)} alt={getDeveloperName(approvedApplication)} />
                  <AvatarFallback>{getDeveloperName(approvedApplication).charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{getDeveloperName(approvedApplication)}</h4>
                  <p className="text-sm text-muted-foreground">Ready to help with your request</p>
                </div>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <AlertDescription>
                  Start chatting with {getDeveloperName(approvedApplication)} to discuss your request and get started.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter className="flex sm:justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
            <Button 
              className="flex gap-2"
              onClick={() => approvedApplication && handleStartChat(approvedApplication.developer_id, approvedApplication.id)}
            >
              <MessageCircle className="h-4 w-4" />
              Start Chatting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeveloperApplications;
