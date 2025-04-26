
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { HelpRequest } from '../../types/helpRequest';
import { formatTicketStatus, getTicketStatusStyles } from '../../utils/ticketStatusUtils';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/auth';
import { useNavigate } from 'react-router-dom';
import { messageTypeIconMap } from '../../utils/messageTypeIcons';
import { useTicketApplications } from '../../hooks/ticket-detail/useTicketApplications';
import MainContent from './MainContent';
import SidebarContent from './SidebarContent';

interface TicketDetailContentProps {
  ticket: HelpRequest | null;
  isLoading: boolean;
  hasError: boolean | string;
  ticketId: string;
  onTicketAccepted: () => void;
  onStatusUpdated: () => Promise<void>;
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

  const isClient = userType === 'client';
  const isDeveloper = userType === 'developer';

  const { applications, isLoadingApplications } = useTicketApplications(
    ticketId,
    userId,
    isClient
  );

  const handleStatusUpdated = async (): Promise<void> => {
    return onStatusUpdated();
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
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{ticket?.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className={getTicketStatusStyles(ticket?.status || 'open')}>
                {formatTicketStatus(ticket?.status || 'Open')}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Created {ticket?.created_at && formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </p>
              {ticket?.ticket_number && (
                <Badge variant="outline" className="text-muted-foreground">
                  #{ticket.ticket_number}
                </Badge>
              )}
            </div>
          </div>
          {isClient && ticket && (
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
          {ticket?.description || "No description provided."}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {ticket?.technical_area && ticket.technical_area.map((area: string) => (
            <Badge key={area} variant="secondary">
              {area}
            </Badge>
          ))}
          {ticket?.urgency && (
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
        <div className="col-span-1 lg:col-span-2">
          <MainContent
            ticket={ticket}
            ticketId={ticketId}
            userId={userId!}
            isClient={isClient}
            applications={applications}
            isLoadingApplications={isLoadingApplications}
            onRefresh={onRefresh}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
        
        <div className="col-span-1">
          <SidebarContent
            isDeveloper={isDeveloper}
            ticket={ticket}
            ticketId={ticketId}
            applicationStatus={applicationStatus}
            hasApplied={hasApplied}
            onApply={() => onApply(ticketId)}
            onRefresh={handleStatusUpdated}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketDetailContent;
