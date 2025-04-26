
import { HelpRequestMatch } from '../../hooks/useTicketApplications';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MessageCircle } from 'lucide-react';

interface ApplicationCardProps {
  application: HelpRequestMatch;
}

const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const handleApprove = () => {
    // TODO: Implement approval logic
    console.log('Approve application:', application.id);
  };

  const handleReject = () => {
    // TODO: Implement rejection logic
    console.log('Reject application:', application.id);
  };

  const handleChat = () => {
    // TODO: Implement chat logic
    console.log('Open chat with:', application.developer_id);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-row justify-between items-start space-y-0">
        <div>
          <h3 className="text-lg font-semibold">
            {application.profiles?.name || 'Anonymous Developer'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Match Score: {Math.round(application.match_score * 100)}%
          </p>
        </div>
        {application.status === 'approved' && (
          <Badge variant="default" className="bg-green-500">Approved</Badge>
        )}
        {application.status === 'rejected' && (
          <Badge variant="secondary" className="bg-gray-400">Rejected</Badge>
        )}
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Rate:</span>
            <span className="font-semibold">${application.proposed_rate}/hr</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Duration:</span>
            <span className="font-semibold">{application.proposed_duration} hours</span>
          </div>
          {application.proposed_message && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                {application.proposed_message}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {application.status === 'pending' && (
        <CardFooter className="gap-2">
          <Button 
            onClick={handleApprove}
            className="flex-1"
            variant="default"
          >
            Approve
          </Button>
          <Button 
            onClick={handleChat}
            variant="outline"
            size="icon"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleReject}
            className="flex-1"
            variant="destructive"
          >
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ApplicationCard;
