
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { messageTypeIconMap } from '../../utils/messageTypeIcons';
import { HelpRequest, HelpRequestMatch } from '../../types/helpRequest';
import { formatTicketStatus, getTicketStatusStyles } from '../../utils/ticketStatusUtils';
import { formatDistanceToNow } from 'date-fns';
import DeveloperApplicationPanel from '../developer-ticket-detail/DeveloperApplicationPanel';
import DeveloperApplicationsPanel from '../dashboard/DeveloperApplicationsPanel';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';
import StatusActionCard from './StatusActionCard';
import TicketHistoryPanel from './TicketHistoryPanel';
import TicketDetailsPanel from './TicketDetailsPanel';
import TicketCommentsPanel from './TicketCommentsPanel';
import AttachmentsPanel from './AttachmentsPanel';

interface TicketDetailContentProps {
  ticket: HelpRequest | null;
  isLoading: boolean;
  hasError: boolean | string;
  ticketId: string;
  onTicketAccepted: () => void;
  onStatusUpdated: () => void;
  onApply: (ticketId: string) => void;
  applicationStatus: string | null;
  hasApplied: boolean;
  onRefresh: () => void;
}

const TicketDetailContent: React.FC<TicketDetailContentProps> = ({
  ticket,
  isLoading,
  hasError,
  ticketId,
  onTicketAccepted,
  onStatusUpdated,
  onApply,
  applicationStatus,
  hasApplied,
  onRefresh
}) => {
  const navigate = useNavigate();
  const { userId, userType } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [applications, setApplications] = useState<HelpRequestMatch[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  const isClient = userType === 'client';
  const isDeveloper = userType === 'developer';

  // Fetch developer applications if user is a client
  useEffect(() => {
    if (!isClient || !ticketId || !userId) return;
    
    const fetchApplications = async () => {
      setIsLoadingApplications(true);
      try {
        const { data, error } = await supabase
          .from('help_request_matches')
          .select(`
            *,
            profiles:developer_id (id, name, image)
          `)
          .eq('request_id', ticketId);
          
        if (error) {
          console.error('Error fetching applications:', error);
          return;
        }
        
        // Process applications to ensure they match our type
        const typedApplications: HelpRequestMatch[] = (data || []).map(app => {
          // Handle potentially malformed profiles data
          let safeProfiles = app.profiles;
          
          if (!safeProfiles || typeof safeProfiles !== 'object') {
            safeProfiles = { 
              id: app.developer_id, 
              name: 'Unknown Developer',
              image: null
            };
          }
          
          return {
            ...app,
            profiles: safeProfiles
          } as HelpRequestMatch;
        });
        
        setApplications(typedApplications);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setIsLoadingApplications(false);
      }
    };
    
    fetchApplications();
    
    // Set up real-time subscription for applications
    const channel = supabase
      .channel(`applications-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_request_matches',
          filter: `request_id=eq.${ticketId}`
        },
        () => {
          console.log('[TicketDetail] Applications updated, refreshing');
          fetchApplications();
          onRefresh(); // Also refresh the main ticket data
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, userId, isClient, onRefresh]);

  const handleOpenChat = (developerId: string, developerName?: string) => {
    if (!ticketId || !developerId) return;
    navigate(`/chat/${ticketId}?with=${developerId}&name=${developerName || 'Developer'}`);
  };

  // Fix for function signature error: wrapping in a parameter-less function
  const handleTicketAccepted = () => {
    onTicketAccepted();
  };

  // Fix for Promise<void> error: returning a Promise
  const handleStatusUpdated = async () => {
    onStatusUpdated();
    return Promise.resolve();
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            {typeof hasError === 'string' ? hasError : 'An error occurred while loading the ticket.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRefresh}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!ticket) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Found</CardTitle>
          <CardDescription>
            The requested ticket could not be found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Ticket Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className={getTicketStatusStyles(ticket.status || 'open')}>
                {formatTicketStatus(ticket.status || 'Open')}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Created {ticket.created_at && formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </p>
              {ticket.ticket_number && (
                <Badge variant="outline" className="text-muted-foreground">
                  #{ticket.ticket_number}
                </Badge>
              )}
            </div>
          </div>
          {isClient && (
            <Button
              onClick={() => navigate(`/chat/${ticket.id}`)}
              variant="outline"
            >
              {messageTypeIconMap.chat}
              Open Chat
            </Button>
          )}
        </div>
        
        <p className="text-muted-foreground">
          {ticket.description || "No description provided."}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {ticket.technical_area && ticket.technical_area.map((area: string) => (
            <Badge key={area} variant="secondary">
              {area}
            </Badge>
          ))}
          {ticket.urgency && (
            <Badge 
              variant="outline" 
              className={
                ticket.urgency === 'high' ? 'text-red-600 border-red-200 bg-red-50' :
                ticket.urgency === 'medium' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                'text-blue-600 border-blue-200 bg-blue-50'
              }
            >
              {ticket.urgency.charAt(0).toUpperCase() + ticket.urgency.slice(1)} Priority
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Tabs for Ticket Details, Comments, etc. */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              {isClient && applications.length > 0 && (
                <TabsTrigger value="applications">
                  Applications
                  {applications.filter(a => a.status === 'pending').length > 0 && (
                    <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200" variant="outline">
                      {applications.filter(a => a.status === 'pending').length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="details">
              <TicketDetailsPanel ticket={ticket} />
            </TabsContent>
            
            <TabsContent value="comments">
              <TicketCommentsPanel ticketId={ticketId} />
            </TabsContent>
            
            <TabsContent value="history">
              <TicketHistoryPanel ticketId={ticketId} />
            </TabsContent>
            
            <TabsContent value="attachments">
              <AttachmentsPanel ticket={ticket} />
            </TabsContent>
            
            {isClient && (
              <TabsContent value="applications">
                <DeveloperApplicationsPanel
                  applications={applications}
                  ticketId={ticketId}
                  clientId={userId!}
                  isLoading={isLoadingApplications}
                  onApplicationUpdate={onRefresh}
                  onOpenChat={handleOpenChat}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        <div className="col-span-1 space-y-6">
          {/* Action Panels */}
          {isDeveloper && (
            <DeveloperApplicationPanel
              devUpdateVisibility={{
                show: !!(applicationStatus === "approved" && hasApplied),
                reason: "",
              }}
              ticket={ticket}
              ticketId={ticketId}
              userType={userType}
              applicationStatus={applicationStatus}
              hasApplied={hasApplied}
              onApply={onApply}
              fetchLatestTicketData={onRefresh}
            />
          )}
          
          <StatusActionCard
            ticket={ticket}
            userType={userType as any}
            onStatusUpdated={handleStatusUpdated}
          />
          
          <TicketHistoryPanel 
            ticketId={ticketId} 
            compact={true} 
            limit={5} 
          />
        </div>
      </div>
    </div>
  );
};

export default TicketDetailContent;
