import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Clock, CheckCircle2, AlertCircle, BarChart3, Calendar, Bell, Star, FileEdit, User, ExternalLink } from 'lucide-react';
import { Progress } from '../ui/progress';
import { HELP_REQUEST_STATUSES } from '../../utils/constants/statusConstants';
import { useNavigate } from 'react-router-dom';
import TicketStatus from './TicketStatus';
import PendingApplicationsBadge from '../dashboard/PendingApplicationsBadge';

interface TicketWithApplications extends HelpRequest {
  pendingApplicationsCount?: number;
}

interface TicketListItemProps {
  ticket: TicketWithApplications;
  expandedTicket: string | null;
  isRecommended?: boolean;
  isApplication?: boolean;
  onTicketClick: (ticketId: string) => void;
  onViewDetails: (ticketId: string) => void;
  onClaimClick: (ticketId: string) => void;
  onApplyClick: (ticket: HelpRequest) => void;
  onChatClick?: (helpRequestId: string, clientId: string, clientName?: string) => void;
  viewMode?: 'grid' | 'list';
}

const isTicketClaimable = (status: string): boolean => {
  const claimableStatuses = [
    HELP_REQUEST_STATUSES.SUBMITTED,
    HELP_REQUEST_STATUSES.PENDING_MATCH,
    HELP_REQUEST_STATUSES.DEV_REQUESTED,
    HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL
  ];
  
  const normalizedStatus = status?.replace(/-/g, '_');
  
  return claimableStatuses.includes(normalizedStatus as any) || 
         claimableStatuses.includes(status as any);
};

const TicketListItem: React.FC<TicketListItemProps> = ({
  ticket,
  expandedTicket,
  isRecommended,
  isApplication,
  onTicketClick,
  onViewDetails,
  onClaimClick,
  onApplyClick,
  onChatClick,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();

  const pendingCount = ticket.pendingApplicationsCount ?? 0;

  const handleViewDetails = (ticketId: string) => {
    if (pendingCount > 0) {
      navigate(`/client/help-request/${ticketId}/applications`);
    } else {
      onViewDetails(ticketId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'matching': return <User className="h-4 w-4 text-blue-500" />;
      case 'in-progress': return <BarChart3 className="h-4 w-4 text-purple-500" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-indigo-500" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  console.log(`Rendering ticket ${ticket.id} with status ${ticket.status}, isApplication: ${isApplication}`);

  const shouldShowClaimButton = !isApplication && !isRecommended && isTicketClaimable(ticket.status || '');

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-medium truncate">{ticket.title}</h3>
            <TicketStatus status={ticket.status || 'pending'} />
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
          
          {ticket.id && !isApplication && (
            <PendingApplicationsBadge count={pendingCount} />
          )}
          
          <div className="flex flex-wrap gap-1">
            {ticket.technical_area && ticket.technical_area.map((area, i) => (
              <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(ticket.id!)}
          >
            {ticket.pendingApplicationsCount && ticket.pendingApplicationsCount > 0 
              ? 'Review Applications' 
              : 'View Details'}
          </Button>
          
          {onChatClick && isApplication && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChatClick(ticket.id!, ticket.client_id!, 'Client')}
            >
              Chat
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${
      expandedTicket === ticket.id ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-2 space-y-1">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base truncate flex items-center">
            {ticket.title}
          </CardTitle>
          <TicketStatus status={ticket.status || 'pending'} />
        </div>
        <CardDescription className="line-clamp-2 text-xs">
          {ticket.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {ticket.id && !isApplication && (
          <PendingApplicationsBadge count={pendingCount} />
        )}
        
        <div className="flex flex-wrap gap-1 mb-3">
          {ticket.technical_area && ticket.technical_area.slice(0, 3).map((area, i) => (
            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
              {area}
            </Badge>
          ))}
          {ticket.technical_area && ticket.technical_area.length > 3 && (
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">
              +{ticket.technical_area.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            {getStatusIcon(ticket.status || 'pending')}
            <span>Status: {ticket.status}</span>
          </div>
          
          {isRecommended && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Recommendation Score</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="h-1.5" />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          className="w-full"
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(ticket.id!)}
        >
          {ticket.pendingApplicationsCount && ticket.pendingApplicationsCount > 0 
            ? 'Review Applications' 
            : 'View Details'}
        </Button>
        
        {isApplication && onChatClick && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onChatClick(ticket.id!, ticket.client_id!, 'Client')}
          >
            Chat with Client
          </Button>
        )}
        
        {isRecommended && (
          <Button className="w-full" size="sm" onClick={() => onApplyClick(ticket)}>
            Apply for Ticket
          </Button>
        )}
        
        {shouldShowClaimButton && (
          <Button className="w-full" size="sm" onClick={() => onClaimClick(ticket.id!)}>
            Claim Ticket
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TicketListItem;
