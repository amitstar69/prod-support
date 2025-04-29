
import { HelpRequestMatch } from '../../types/helpRequest';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationsListProps {
  applications: HelpRequestMatch[];
  isLoading?: boolean;
}

const ApplicationsList = ({ applications, isLoading }: ApplicationsListProps) => {
  if (isLoading) {
    return <div className="space-y-4">Loading applications...</div>;
  }

  if (!applications.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No applications found.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={application.profiles?.image || ''} />
                <AvatarFallback>
                  {application.profiles?.name?.[0] || 'D'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-medium">
                  {application.profiles?.name || 'Anonymous Developer'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Applied {application.created_at && 
                    formatDistanceToNow(new Date(application.created_at), { 
                      addSuffix: true 
                    })
                  }
                </p>
                {application.developer_profiles?.experience && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {application.developer_profiles.experience}
                  </p>
                )}
              </div>
            </div>
            
            <Badge className={
              application.status === 'approved' ? 'bg-green-100 text-green-800' :
              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-amber-100 text-amber-800'
            }>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
          
          {application.proposed_message && (
            <p className="mt-3 text-sm text-muted-foreground">
              {application.proposed_message}
            </p>
          )}
          
          {application.proposed_rate && (
            <p className="mt-2 text-sm">
              Proposed Rate: ${application.proposed_rate}/hr
            </p>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ApplicationsList;
