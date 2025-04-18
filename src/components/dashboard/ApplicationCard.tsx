
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, Hourglass, DollarSign, MessageCircle, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { ApplicationStatus } from '../../types/helpRequest';
import { VALID_MATCH_STATUSES } from '../../integrations/supabase/helpRequestsApplications';

interface ApplicationCardProps {
  application: any;
  onApprove: (applicationId: string) => Promise<void>;
  onReject: (applicationId: string) => Promise<void>;
  onOpenChat: (developerId: string, applicationId: string) => void;
  onViewDetails?: (applicationId: string) => void;
  isProcessing: (applicationId: string) => boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onApprove,
  onReject,
  onOpenChat,
  onViewDetails,
  isProcessing
}) => {
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
    if (application.developer?.name) {
      return application.developer.name;
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
    if (application.developer?.image) {
      return application.developer.image;
    }
    return '/placeholder.svg';
  };

  const APPLICATION_STATUSES = VALID_MATCH_STATUSES;

  return (
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
              ${application.status === APPLICATION_STATUSES.APPROVED ? 'bg-green-50 text-green-800 border-green-200' : 
               application.status === APPLICATION_STATUSES.REJECTED ? 'bg-red-50 text-red-800 border-red-200' :
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
            <p className="line-clamp-3">{application.proposed_message}</p>
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
        {onViewDetails && (
          <Button 
            className="w-full"
            variant="outline"
            onClick={() => onViewDetails(application.id)}
            disabled={isProcessing(application.id)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
        )}
        
        {application.status === APPLICATION_STATUSES.PENDING && (
          <div className="flex gap-2 w-full">
            <Button 
              className="flex-1"
              onClick={() => onApprove(application.id)}
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
              onClick={() => onReject(application.id)}
              disabled={isProcessing(application.id)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
        
        <Button 
          className={application.status === APPLICATION_STATUSES.PENDING ? 'w-full' : 'flex-1'}
          variant={application.status === APPLICATION_STATUSES.PENDING ? 'outline' : 'default'}
          onClick={() => onOpenChat(application.developer_id, application.id)}
          disabled={isProcessing(application.id)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Message
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;
