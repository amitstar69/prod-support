import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  ExternalLink, 
  ArrowUpRight, 
  Clock, 
  DollarSign, 
  Zap, 
  CheckCircle, 
  MessageCircle,
  ClipboardCheck,
  UserCheck,
  ThumbsUp 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
}

const TicketListItem: React.FC<TicketListItemProps> = ({
  ticket,
  expandedTicket,
  isRecommended = false,
  isApplication = false,
  onTicketClick,
  onViewDetails,
  onClaimClick,
  onApplyClick,
  onChatClick
}) => {
  const isExpanded = expandedTicket === ticket.id;
  const ticketKey = ticket.ticket_number ? 
    `TICKET-${ticket.ticket_number}` : 
    `TICKET-${Math.floor(Math.random() * 900) + 100}`;
    
  const isOpen = ticket.status === 'open' || ticket.status === 'pending';
  const isClaimed = ticket.status === 'claimed';
  const isInProgress = ticket.status === 'in-progress';
  const isDeveloperQA = ticket.status === 'developer-qa';
  const isClientReview = ticket.status === 'client-review';
  const isClientApproved = ticket.status === 'client-approved';
  const isActionable = isOpen || isClaimed || isInProgress || isDeveloperQA || isClientReview;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch(urgency) {
      case 'high': return <Zap className="h-4 w-4 text-orange-500" />;
      case 'critical': return <Zap className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBudgetIcon = (budgetRange: string) => {
    const dollarCount = budgetRange.split('$').length - 1;
    return (
      <div className="flex">
        {[...Array(Math.min(dollarCount, 3))].map((_, i) => (
          <DollarSign key={i} className="h-4 w-4 text-green-500" />
        ))}
      </div>
    );
  };

  const getStatusClass = (status?: string) => {
    switch(status) {
      case 'open': return 'bg-green-50 text-green-800 border-green-200';
      case 'claimed': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'developer-qa': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'client-review': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'client-approved': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'resolved': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'completed': return 'bg-slate-50 text-slate-800 border-slate-200';
      case 'cancelled': return 'bg-red-50 text-red-800 border-red-200';
      case 'matching': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'scheduled': return 'bg-purple-50 text-purple-800 border-purple-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'developer-qa': return <ClipboardCheck className="h-3.5 w-3.5 mr-1 text-indigo-600" />;
      case 'client-review': return <UserCheck className="h-3.5 w-3.5 mr-1 text-orange-600" />;
      case 'client-approved': return <ThumbsUp className="h-3.5 w-3.5 mr-1 text-emerald-600" />;
      default: return null;
    }
  };

  return (
    <div
      className={`bg-white border border-border/20 rounded-lg overflow-hidden transition-all duration-200 ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'} ${isRecommended ? 'ring-2 ring-primary/20' : ''}`}
    >
      {isRecommended && (
        <div className="bg-primary/10 text-primary text-xs py-1 px-3 text-center font-medium">
          Recommended for your skills
        </div>
      )}
      
      <div 
        className="p-4 cursor-pointer"
        onClick={() => onTicketClick(ticket.id || '')}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{ticketKey}</span>
              {ticket.urgency && (
                <div className="flex items-center gap-1 text-xs">
                  {getUrgencyIcon(ticket.urgency)}
                  <span className="capitalize">{ticket.urgency}</span>
                </div>
              )}
              {ticket.budget_range && (
                <div className="flex items-center gap-1 text-xs">
                  {getBudgetIcon(ticket.budget_range)}
                </div>
              )}
            </div>
            <h3 className="text-lg font-medium mt-1">{ticket.title}</h3>
          </div>
          <Badge 
            variant="outline"
            className={getStatusClass(ticket.status)}
          >
            <span className="flex items-center">
              {getStatusIcon(ticket.status)}
              {ticket.status || 'open'}
            </span>
          </Badge>
        </div>
        
        {isApplication && (
          <div className="flex items-center gap-2 mb-2 text-sm">
            <span className="font-medium">Application Status:</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
              <span className="flex items-center gap-1">
                {ticket.status === 'in-progress' ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    Accepted
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    Pending Review
                  </>
                )}
              </span>
            </Badge>
          </div>
        )}
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {ticket.description}
        </p>
        
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
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Details</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Created: {formatDate(ticket.created_at)}</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    <span>Duration: ~{ticket.estimated_duration} minutes</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Communication</h4>
                <div className="flex flex-wrap gap-1">
                  {ticket.communication_preference && ticket.communication_preference.map((pref, i) => (
                    <Badge key={i} variant="outline" className="bg-secondary text-foreground border-secondary/20 text-xs">
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                size="sm" 
                variant="outline"
                className="h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  ticket.id && onViewDetails(ticket.id);
                }}
              >
                View Details
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Button>
              
              {isOpen ? (
                <Button 
                  size="sm"
                  className="h-8 bg-primary text-white hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyClick(ticket);
                  }}
                >
                  Apply
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : isClaimed ? (
                <Button 
                  size="sm"
                  className="h-8 bg-primary text-white hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    ticket.id && onClaimClick(ticket.id);
                  }}
                >
                  Start Work
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : isInProgress || isDeveloperQA || isClientReview || isClientApproved ? (
                <Button 
                  size="sm"
                  className="h-8 bg-primary text-white hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    ticket.id && onClaimClick(ticket.id);
                  }}
                >
                  View Progress
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  disabled 
                  variant="outline"
                  className="h-8"
                >
                  {ticket.status === 'resolved' ? 'Resolved' :
                   ticket.status === 'completed' ? 'Completed' :
                   ticket.status === 'cancelled' ? 'Cancelled' : 'Unavailable'}
                </Button>
              )}
              
              {onChatClick && ticket.client_id && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChatClick(ticket.id || '', ticket.client_id, ticket.client_name);
                  }}
                >
                  Chat
                  <MessageCircle className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketListItem;
