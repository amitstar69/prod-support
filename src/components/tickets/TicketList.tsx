
import React from 'react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { HelpRequest } from '../../types/helpRequest';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export interface TicketListProps {
  tickets: HelpRequest[];
  userRole: string;
  onClaimTicket?: (ticketId: string) => void;
  userId?: string | null;
  userType?: string | null;
  isAuthenticated?: boolean;
  onOpenChat?: (helpRequestId: string, clientId: string, clientName?: string) => void;
  viewMode?: 'list' | 'grid';
  isApplication?: boolean;
  isRecommended?: boolean;
}

const TicketList: React.FC<TicketListProps> = ({ 
  tickets, 
  userRole,
  onClaimTicket,
  userId,
  userType,
  isAuthenticated,
  onOpenChat,
  viewMode = 'grid',
  isApplication = false,
  isRecommended = false
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string = 'open') => {
    switch (status.toLowerCase()) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">In Progress</Badge>;
      case 'awaiting_client_approval':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Awaiting Approval</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string = 'low') => {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
      default:
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
    }
  };

  const handleTicketClick = (ticketId: string | undefined) => {
    if (!ticketId) return;
    
    if (userRole === 'client') {
      navigate(`/client/tickets/${ticketId}`);
    } else if (userRole === 'developer') {
      navigate(`/tickets/${ticketId}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card 
          key={ticket.id} 
          className="p-4 hover:shadow-md cursor-pointer transition-shadow"
          onClick={() => handleTicketClick(ticket.id)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{ticket.title || 'Untitled Ticket'}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {ticket.technical_area?.slice(0, 3).map((area, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    {area}
                  </Badge>
                ))}
                {ticket.technical_area && ticket.technical_area.length > 3 && (
                  <Badge variant="outline">+{ticket.technical_area.length - 3} more</Badge>
                )}
              </div>
            </div>
            
            <div className="sm:text-right space-y-2">
              <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                {getStatusBadge(ticket.status)}
                {getUrgencyBadge(ticket.urgency)}
              </div>
              <div className="text-xs text-muted-foreground">
                Created {formatDate(ticket.created_at)}
              </div>
              {ticket.ticket_number && (
                <div className="text-xs text-muted-foreground">
                  #{ticket.ticket_number}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TicketList;
