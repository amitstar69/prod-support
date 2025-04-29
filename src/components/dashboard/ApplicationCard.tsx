
import React from 'react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MATCH_STATUSES } from '../../utils/constants/statusConstants';
import { formatDistanceToNow } from 'date-fns';
import { Eye, MessageSquare } from 'lucide-react';

interface ApplicationCardProps {
  application: any;
  onApprove: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
  onViewDetails: (applicationId: string) => void;
  onOpenChat: (developerId: string, applicationId: string) => void;
  isProcessing: (applicationId: string) => boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onApprove,
  onReject,
  onViewDetails,
  onOpenChat,
  isProcessing
}) => {
  // Safely access the developer profile data
  const developerName = application.profiles?.name || 'Anonymous Developer';
  const developerImage = application.profiles?.image || '';
  const developerExperience = application.developer_profiles?.experience || '';
  const applicationStatus = application.status;
  const applicationDate = application.created_at;
  const isProcessingAction = isProcessing(application.id);
  
  // Get appropriate status display
  const getStatusBadge = () => {
    switch (applicationStatus) {
      case MATCH_STATUSES.APPROVED_BY_CLIENT:
        return <Badge variant="success">Approved</Badge>;
      case MATCH_STATUSES.REJECTED_BY_CLIENT:
        return <Badge variant="destructive">Rejected</Badge>;
      case MATCH_STATUSES.PENDING:
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{applicationStatus}</Badge>;
    }
  };
  
  return (
    <Card className="overflow-hidden border border-muted">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={developerImage} alt={developerName} />
              <AvatarFallback>{developerName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="font-semibold leading-none">{developerName}</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                {applicationDate && (
                  <span>Applied {formatDistanceToNow(new Date(applicationDate), { addSuffix: true })}</span>
                )}
              </div>
            </div>
            <div className="ml-auto">{getStatusBadge()}</div>
          </div>
          
          {developerExperience && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-2">{developerExperience}</p>
            </div>
          )}
          
          {application.proposed_message && (
            <div className="p-3 bg-muted/20 rounded-md">
              <p className="text-sm italic">"{application.proposed_message}"</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap justify-between gap-2 p-4 pt-0">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails(application.id)}
        >
          <Eye className="mr-1 h-4 w-4" /> Details
        </Button>
        
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChat(application.developer_id, application.id)}
          >
            <MessageSquare className="mr-1 h-4 w-4" /> Chat
          </Button>
          
          {applicationStatus === MATCH_STATUSES.PENDING && (
            <>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onReject(application.id)}
                disabled={isProcessingAction}
              >
                Reject
              </Button>
              <Button 
                size="sm"
                onClick={() => onApprove(application.id)}
                disabled={isProcessingAction}
              >
                Accept
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;
