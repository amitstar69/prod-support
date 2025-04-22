
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Clock, CheckCircle2, AlertCircle, BarChart3, Calendar, Bell, Star, FileEdit, User, ExternalLink } from 'lucide-react';
import { Progress } from '../ui/progress';
import { STATUSES } from '../../utils/helpRequestStatusUtils';

interface TicketListItemProps {
  ticket: HelpRequest;
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

// Helper function to check if a ticket is in a claimable state
const isTicketClaimable = (status: string): boolean => {
  const claimableStatuses = [
    STATUSES.SUBMITTED,
    STATUSES.PENDING_MATCH,
    STATUSES.DEV_REQUESTED,
    STATUSES.AWAITING_CLIENT_APPROVAL
  ];
  
  // Normalize status (replace hyphens with underscores)
  const normalizedStatus = status?.replace(/-/g, '_');
  
  // Check if status is in the claimable list
  return claimableStatuses.includes(normalizedStatus) || 
         claimableStatuses.includes(status);
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
  // Handle view details with logging
  const handleViewDetails = (ticketId: string) => {
    console.log('View Details clicked:', {
      ticketId,
      isApplication,
      currentPath: window.location.pathname,
      userContext: window.location.pathname.includes('/developer') ? 'developer' : 'client'
    });

    onViewDetails(ticketId);
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

  // Determine if this ticket should show claim button
  // Never show claim button for applications (tickets already approved for the developer)
  const shouldShowClaimButton = !isApplication && !isRecommended && isTicketClaimable(ticket.status || '');

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-medium truncate">{ticket.title}</h3>
            <Badge 
              variant="outline"
              className={`
                ${ticket.status === 'in-progress' ? 'bg-green-50 text-green-800 border-green-200' : 
                 ticket.status === 'matching' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                 ticket.status === 'scheduled' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                 'bg-yellow-50 text-yellow-800 border-yellow-200'}
              `}
            >
              <span className="flex items-center gap-1">
                {getStatusIcon(ticket.status || 'pending')}
                {ticket.status}
              </span>
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
          
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
            View Details
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

  // Grid view (default)
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${
      expandedTicket === ticket.id ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-2 space-y-1">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base truncate flex items-center">
            {ticket.title}
          </CardTitle>
          <Badge 
            variant="outline"
            className={`
              ${ticket.status === 'in-progress' ? 'bg-green-50 text-green-800 border-green-200' : 
               ticket.status === 'matching' ? 'bg-blue-50 text-blue-800 border-blue-200' :
               ticket.status === 'scheduled' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
               'bg-yellow-50 text-yellow-800 border-yellow-200'}
            `}
          >
            {ticket.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 text-xs">{ticket.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
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
          <ExternalLink className="h-4 w-4 mr-2" />
          View Details
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
