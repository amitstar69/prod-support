import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, Handshake, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ScheduleSessionButton } from '../session/ScheduleSessionButton';

interface TicketListProps {
  tickets: HelpRequest[];
  onClaimTicket: (ticket: HelpRequest) => void;
  currentUserId?: string | null;
  isAuthenticated?: boolean;
  isRecommended?: boolean;
  isApplication?: boolean;
}

const TicketList: React.FC<TicketListProps> = ({ 
  tickets, 
  onClaimTicket, 
  currentUserId,
  isAuthenticated = false,
  isRecommended = false,
  isApplication = false,
}) => {
  const navigate = useNavigate();

  const statusToLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Open';
      case 'matching':
        return 'Matching';
      case 'scheduled':
        return 'Scheduled';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };
  
  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'High Urgency';
      case 'medium':
        return 'Medium Urgency';
      case 'low':
        return 'Low Urgency';
      default:
        return 'Normal Urgency';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };
  
  const formatApplicationStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };
  
  const handleDetailsClick = (ticket: HelpRequest) => {
    // Navigate to the ticket details page
    console.log('View details clicked for ticket:', ticket.id);
  };
  
  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div 
          key={ticket.id} 
          className={`border rounded-lg p-4 md:p-6 transition-all duration-200 ${
            isRecommended ? 'bg-yellow-50 border-yellow-200' : 'bg-white'
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline" className="font-normal">
                  {ticket.status ? statusToLabel(ticket.status) : 'Status unknown'}
                </Badge>
                
                <Badge variant="outline" className="text-blue-600 border-blue-300 font-normal">
                  {getUrgencyLabel(ticket.urgency)}
                </Badge>
                
                <Badge variant="outline" className="font-normal">
                  Est. {ticket.estimated_duration || '?'} mins
                </Badge>
              </div>
              
              <h3 className="text-lg font-medium mb-1">{ticket.title}</h3>
              
              <p className="text-muted-foreground mb-3 line-clamp-2">{ticket.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {ticket.technical_area?.map((area: string) => (
                  <Badge key={area} variant="secondary" className="font-normal">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col justify-between items-start md:items-end gap-3 min-w-[140px]">
              <div className="text-sm text-muted-foreground">
                {ticket.created_at ? formatDate(ticket.created_at) : 'Date unknown'}
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {!isApplication && isAuthenticated && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full whitespace-nowrap"
                    onClick={() => handleDetailsClick(ticket)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View Details
                  </Button>
                )}
                
                {/* Show Claim button only for authenticated developers who are not the creator */}
                {!isApplication && isAuthenticated && currentUserId !== ticket.client_id && (
                  <Button 
                    size="sm"
                    className="w-full whitespace-nowrap"
                    onClick={() => onClaimTicket(ticket)}
                    disabled={ticket.status !== 'pending' && ticket.status !== 'matching'}
                  >
                    <Handshake className="h-3.5 w-3.5 mr-1.5" />
                    Apply
                  </Button>
                )}
                
                {/* Show schedule button only for authenticated developers who have applied */}
                {isApplication && isAuthenticated && ticket.status === 'matching' && (
                  <ScheduleSessionButton 
                    helpRequest={ticket} 
                    developerId={currentUserId || ''} 
                    variant="default"
                    className="w-full whitespace-nowrap text-sm h-9 px-3"
                  />
                )}
                
                {/* If this is the client viewing their own ticket with applications */}
                {isAuthenticated && currentUserId === ticket.client_id && ticket.applications && ticket.applications.length > 0 && (
                  <Button 
                    size="sm"
                    variant="outline"
                    className="w-full whitespace-nowrap"
                    onClick={() => handleDetailsClick(ticket)}
                  >
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    {ticket.applications.length} {ticket.applications.length === 1 ? 'Developer' : 'Developers'}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Additional application details for application view */}
          {isApplication && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm">Application Status:</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatApplicationStatus(ticket.application_status || 'pending')}
                  </p>
                </div>
                
                {ticket.application_status === 'accepted' && (
                  <ScheduleSessionButton 
                    helpRequest={ticket} 
                    developerId={currentUserId || ''} 
                    variant="default"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TicketList;
