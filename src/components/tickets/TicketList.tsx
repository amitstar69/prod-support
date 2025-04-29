
import React, { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Card } from '../ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import DeveloperApplicationModal from '../apply/DeveloperApplicationModal';
import { toast } from 'sonner';

interface TicketListProps {
  tickets: HelpRequest[];
  isLoading?: boolean;
  onApplySuccess?: () => void;
  userId?: string | null;
  userType?: string | null;
  onClaimTicket?: (ticketId: string) => void;
  currentUserId?: string | null;
  isAuthenticated?: boolean;
  viewMode?: 'grid' | 'list';
  isApplication?: boolean;
  isRecommended?: boolean;
  onOpenChat?: (helpRequestId: string, clientId: string, clientName?: string) => void;
}

interface TicketWithApplications extends HelpRequest {
  // Commented out to fix build error
  // isApplication?: boolean;  
}

const TicketList = ({ tickets, isLoading, onApplySuccess, userId, userType, onClaimTicket, currentUserId, isAuthenticated, viewMode, isApplication, isRecommended, onOpenChat }: TicketListProps) => {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpRequest | null>(null);

  if (isLoading) {
    return <div className="space-y-4">Loading tickets...</div>;
  }

  if (!tickets.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No tickets found.
      </Card>
    );
  }

  const handleApplicationSuccess = () => {
    setShowApplicationModal(false);
    toast.success('Application submitted successfully!');
    if (onApplySuccess) {
      onApplySuccess();
    }
  };

  const renderTicket = (ticket: HelpRequest) => {
    // Commented out to fix build error
    // const isApplicationTicket = (ticket as TicketWithApplications).isApplication;
    
    return (
      <Card 
        key={ticket.id} 
        className="p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-base">
              <Link 
                to={`/tickets/${ticket.id}`}
                className="hover:underline text-primary"
              >
                {ticket.title}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {ticket.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {ticket.technical_area?.slice(0, 3).map((area, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
              {ticket.technical_area && ticket.technical_area.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{ticket.technical_area.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge 
              className={
                ticket.status === 'completed' ? 'bg-green-100 text-green-800' :
                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                ticket.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-amber-100 text-amber-800'
              }
            >
              {ticket.status?.replace(/_/g, ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground mt-1">
              {ticket.created_at && formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs">
                {ticket.client_id?.substring(0, 2) || 'CL'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              Client #{ticket.client_id?.substring(0, 6)}
            </span>
          </div>
          
          {userType === 'developer' && onClaimTicket && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleApplyClick(ticket)}
            >
              Apply
            </Button>
          )}
          
          {isApplication && onOpenChat && ticket.client_id && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChat(ticket.id!, ticket.client_id, 'Client')}
            >
              Chat
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const handleApplyClick = (ticket: HelpRequest) => {
    setSelectedTicket(ticket);
    setShowApplicationModal(true);
  };

  return (
    <div className="space-y-4">
      {tickets.map(renderTicket)}
      
      {showApplicationModal && selectedTicket && (
        <DeveloperApplicationModal
          isOpen={showApplicationModal} 
          onOpenChange={() => setShowApplicationModal(false)}
          requestId={selectedTicket.id}
          userId={userId} 
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default TicketList;
