import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter
} from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Clock, ArrowUpRight, AlertCircle, CheckCircle, UserCheck } from 'lucide-react';
import { HelpRequest } from '../../../types/helpRequest';
import { formatDistanceToNow } from 'date-fns';

interface ClientTicketCardProps {
  ticket: HelpRequest;
  compact?: boolean;
}

const ClientTicketCard: React.FC<ClientTicketCardProps> = ({ ticket, compact = false }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-blue-500';
      case 'claimed': 
      case 'in-progress': return 'bg-green-500';
      case 'developer-qa': return 'bg-indigo-500';
      case 'client-review': return 'bg-orange-500';
      case 'client-approved': return 'bg-emerald-500';
      case 'completed': return 'bg-green-700';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'developer-qa': return <CheckCircle className="h-4 w-4" />;
      case 'client-review': return <UserCheck className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  const handleViewTicket = () => {
    navigate(`/help-request/${ticket.id}`);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (compact) {
    return (
      <Card className="h-full flex flex-col hover:border-primary/50 transition-colors cursor-pointer" onClick={handleViewTicket}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm line-clamp-2">{ticket.title}</CardTitle>
            <Badge className={`${getStatusColor(ticket.status || 'open')} text-xs`}>
              {getStatusIcon(ticket.status || 'open')}
              <span className="ml-1">{ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="pt-2 mt-auto">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" /> 
            {formatDate(ticket.updated_at || ticket.created_at || '')}
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{ticket.title}</CardTitle>
          <Badge className={`${getStatusColor(ticket.status || 'open')} px-2 py-1 flex items-center gap-1`}>
            {getStatusIcon(ticket.status || 'open')}
            <span>{ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}</span>
          </Badge>
        </div>
        <CardDescription>
          Ticket #{ticket.ticket_number} · {formatDate(ticket.created_at || '')}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
        
        {ticket.technical_area && ticket.technical_area.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {ticket.technical_area.slice(0, 3).map((area) => (
              <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
            ))}
            {ticket.technical_area.length > 3 && (
              <Badge variant="outline" className="text-xs">+{ticket.technical_area.length - 3} more</Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleViewTicket}
          className="ml-auto text-xs flex items-center"
        >
          View Details
          <ArrowUpRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClientTicketCard;
