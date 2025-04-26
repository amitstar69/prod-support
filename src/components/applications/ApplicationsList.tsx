
import { HelpRequestMatch } from '../../types/helpRequest';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationsListProps {
  applications: HelpRequestMatch[];
  onApprove: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
}

export const ApplicationsList = ({ applications, onApprove, onReject }: ApplicationsListProps) => {
  if (applications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No applications found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={application.profiles?.image} 
                    alt={application.profiles?.name || 'Developer'} 
                  />
                  <AvatarFallback>
                    {application.profiles?.name?.substring(0, 2) || 'Dev'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-medium">{application.profiles?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Applied {application.created_at && 
                      formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                  </p>
                  {application.proposed_message && (
                    <p className="mt-2 text-sm">{application.proposed_message}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant={
                  application.status === 'approved' ? 'default' :
                  application.status === 'rejected' ? 'destructive' :
                  'secondary'
                }>
                  {application.status}
                </Badge>
                
                {application.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onReject(application.id!)}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => onApprove(application.id!)}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
