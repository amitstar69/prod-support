import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { HelpRequestMatch } from '../../types/helpRequest';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

interface DeveloperApplicationsPanelProps {
  ticketId: string;
  onApplicationAccepted: () => void;
}

interface ApplicationWithProfile extends Omit<HelpRequestMatch, 'profiles'> {
  profiles?: {
    id?: string;
    name?: string;
    image?: string;
    experience?: string;
  } | null;
}

const DeveloperApplicationsPanel: React.FC<DeveloperApplicationsPanelProps> = ({
  ticketId,
  onApplicationAccepted
}) => {
  const [applications, setApplications] = useState<HelpRequestMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();

    // Setup realtime subscription for applications
    const channel = supabase
      .channel(`ticket-apps-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_request_matches',
          filter: `request_id=eq.${ticketId}`,
        },
        () => {
          console.log('[DeveloperApplicationsPanel] Applications updated, refreshing');
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('help_request_matches')
        .select(`
          *,
          profiles:developer_id (id, name, image, experience)
        `)
        .eq('request_id', ticketId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load developer applications');
        return;
      }
      
      // Ensure the data conforms to our expected type
      const typedApplications: HelpRequestMatch[] = (data || []).map(app => {
        // Handle potentially malformed profiles data
        let safeProfiles = app.profiles;
        
        if (!safeProfiles || typeof safeProfiles !== 'object' || (safeProfiles as any).error) {
          safeProfiles = { 
            id: app.developer_id, 
            name: 'Unknown Developer',
            image: null,
            experience: null
          };
        }

        return {
          ...app,
          profiles: safeProfiles
        } as HelpRequestMatch;
      });
      
      setApplications(typedApplications);
    } catch (err) {
      console.error('Exception fetching applications:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('help_request_matches')
        .update({ status: 'approved' })
        .eq('id', applicationId);
      
      if (error) {
        toast.error('Failed to approve application: ' + error.message);
        return;
      }
      
      // Update help request status to 'approved'
      const { error: ticketError } = await supabase
        .from('help_requests')
        .update({ status: 'approved' })
        .eq('id', ticketId);
      
      if (ticketError) {
        toast.error('Failed to update ticket status: ' + ticketError.message);
        return;
      }
      
      toast.success('Developer application approved!');
      onApplicationAccepted();
    } catch (err) {
      console.error('Error approving application:', err);
      toast.error('An unexpected error occurred');
    }
  };
  
  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('help_request_matches')
        .update({ status: 'rejected' })
        .eq('id', applicationId);
      
      if (error) {
        toast.error('Failed to reject application: ' + error.message);
        return;
      }
      
      toast.success('Developer application rejected');
      fetchApplications();
    } catch (err) {
      console.error('Error rejecting application:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const handleChatWithDeveloper = (developerId: string, developerName: string) => {
    // Navigate to chat or open chat dialog
    console.log('Open chat with developer:', developerId, developerName);
    // Implementation will depend on your chat component
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Developer Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Developer Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-800 p-4 rounded-md">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchApplications} 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!applications.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Developer Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No developers have applied to this help request yet. Check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Developer Applications</CardTitle>
          <Badge>
            {pendingApplications.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* Pending Applications */}
          {pendingApplications.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Pending Applications</h3>
              <div className="space-y-3">
                {pendingApplications.map(application => (
                  <div 
                    key={application.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/20 p-3 rounded-lg gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage 
                          src={application.profiles?.image || ''} 
                          alt={application.profiles?.name || 'Developer'} 
                        />
                        <AvatarFallback>{(application.profiles?.name || 'Dev').substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{application.profiles?.name || 'Anonymous Developer'}</p>
                        <p className="text-xs text-muted-foreground">
                          Applied {application.created_at ? formatDistanceToNow(new Date(application.created_at), { addSuffix: true }) : 'recently'}
                        </p>
                      </div>
                    </div>
                    
                    {application.proposed_message && (
                      <div className="border-l pl-3 hidden md:block">
                        <p className="text-xs italic line-clamp-1">&ldquo;{application.proposed_message}&rdquo;</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleChatWithDeveloper(
                          application.developer_id, 
                          application.profiles?.name || 'Developer'
                        )}
                      >
                        Chat
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectApplication(application.id!)}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApproveApplication(application.id!)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Approved Applications */}
          {approvedApplications.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Approved Applications</h3>
              <div className="space-y-3">
                {approvedApplications.map(application => (
                  <div 
                    key={application.id} 
                    className="flex items-center justify-between bg-green-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage 
                          src={application.profiles?.image || ''} 
                          alt={application.profiles?.name || 'Developer'} 
                        />
                        <AvatarFallback>{(application.profiles?.name || 'Dev').substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{application.profiles?.name || 'Anonymous Developer'}</p>
                        <Badge variant="outline" className="text-xs text-green-700 bg-green-50 border-green-200">
                          Approved
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleChatWithDeveloper(
                        application.developer_id, 
                        application.profiles?.name || 'Developer'
                      )}
                    >
                      Chat
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Rejected Applications (collapsed by default) */}
          {rejectedApplications.length > 0 && (
            <details className="text-sm">
              <summary className="font-medium cursor-pointer">
                Rejected Applications ({rejectedApplications.length})
              </summary>
              <div className="space-y-3 mt-3">
                {rejectedApplications.map(application => (
                  <div 
                    key={application.id} 
                    className="flex items-center justify-between bg-muted/10 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage 
                          src={application.profiles?.image || ''} 
                          alt={application.profiles?.name || 'Developer'} 
                        />
                        <AvatarFallback>{(application.profiles?.name || 'Dev').substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{application.profiles?.name || 'Anonymous Developer'}</p>
                        <Badge variant="outline" className="text-xs text-red-700 bg-red-50 border-red-200">
                          Rejected
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeveloperApplicationsPanel;
