
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { 
  PlusCircle, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  Hourglass, 
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ClientTicketBoardProps {
  tickets: HelpRequest[];
}

const ClientTicketBoard: React.FC<ClientTicketBoardProps> = ({ tickets }) => {
  const navigate = useNavigate();

  // Group tickets by status
  const ticketsByStatus = {
    open: tickets.filter(ticket => 
      ['open', 'pending', 'matching'].includes(ticket.status || '')),
    inProgress: tickets.filter(ticket => 
      ['claimed', 'in-progress', 'developer-qa'].includes(ticket.status || '')),
    review: tickets.filter(ticket => 
      ['client-review', 'client-approved'].includes(ticket.status || '')),
    completed: tickets.filter(ticket => 
      ['completed', 'resolved'].includes(ticket.status || ''))
  };

  const handleTicketClick = (ticketId: string) => {
    navigate(`/client/tickets/${ticketId}`);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const renderTicketCard = (ticket: HelpRequest) => {
    const statusIcons = {
      open: <AlertCircle size={14} className="text-blue-500" />,
      pending: <Clock size={14} className="text-blue-500" />,
      matching: <Hourglass size={14} className="text-blue-500" />,
      claimed: <Clock size={14} className="text-amber-500" />,
      'in-progress': <Hourglass size={14} className="text-amber-500" />,
      'developer-qa': <CheckCircle2 size={14} className="text-amber-500" />,
      'client-review': <UserCheck size={14} className="text-purple-500" />,
      'client-approved': <CheckCircle2 size={14} className="text-purple-500" />,
      completed: <CheckCircle2 size={14} className="text-green-500" />,
      resolved: <CheckCircle2 size={14} className="text-green-500" />
    };

    const ticketKey = ticket.ticket_number ? 
      `TICKET-${ticket.ticket_number}` : 
      `TICKET-${Math.floor(Math.random() * 900) + 100}`;

    return (
      <Card 
        key={ticket.id} 
        className="cursor-pointer hover:shadow-md transition-shadow mb-3"
        onClick={() => ticket.id && handleTicketClick(ticket.id)}
      >
        <CardHeader className="p-3 pb-0 flex flex-row justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              {(statusIcons as any)[ticket.status || 'open']}
              <span className="text-xs font-mono">{ticketKey}</span>
            </div>
            <h3 className="font-medium text-sm line-clamp-2">{ticket.title}</h3>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground line-clamp-2">
            {ticket.description}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-1">
              {ticket.technical_area?.slice(0, 1).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {ticket.technical_area && ticket.technical_area.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  +{ticket.technical_area.length - 1}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(ticket.updated_at)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderColumn = (
    title: string, 
    icon: React.ReactNode, 
    tickets: HelpRequest[], 
    color: string
  ) => {
    return (
      <div className="flex-1 min-w-[250px] max-w-full md:max-w-[350px]">
        <div className={`flex items-center gap-2 mb-3 text-${color}-700 font-medium`}>
          {icon}
          <h3>{title}</h3>
          <Badge variant="outline" className={`ml-1 bg-${color}-50 text-${color}-700 border-${color}-200`}>
            {tickets.length}
          </Badge>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 h-[calc(100vh-380px)] overflow-y-auto">
          {tickets.map(renderTicketCard)}
          {tickets.length === 0 && (
            <div className="text-center p-4 text-muted-foreground text-sm border border-dashed rounded-md">
              No tickets
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-max">
        {renderColumn(
          'Open', 
          <AlertCircle size={16} className="text-blue-600" />, 
          ticketsByStatus.open,
          'blue'
        )}
        {renderColumn(
          'In Progress', 
          <Hourglass size={16} className="text-amber-600" />, 
          ticketsByStatus.inProgress,
          'amber'
        )}
        {renderColumn(
          'Review', 
          <UserCheck size={16} className="text-purple-600" />, 
          ticketsByStatus.review,
          'purple'
        )}
        {renderColumn(
          'Completed', 
          <CheckCircle2 size={16} className="text-green-600" />, 
          ticketsByStatus.completed,
          'green'
        )}
      </div>
    </div>
  );
};

export default ClientTicketBoard;
