
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, Calendar, AlertCircle, CheckCircle2, FileEdit, Play, PauseCircle, User } from 'lucide-react';

interface TicketListProps {
  tickets: HelpRequest[];
  onClaimTicket: (ticketId: string) => void;
  currentUserId: string;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, onClaimTicket, currentUserId }) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'matching': 'bg-blue-100 text-blue-800 border-blue-200',
    'scheduled': 'bg-purple-100 text-purple-800 border-purple-200',
    'in-progress': 'bg-green-100 text-green-800 border-green-200',
    'completed': 'bg-gray-100 text-gray-800 border-gray-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    'pending': <Clock className="h-4 w-4" />,
    'matching': <User className="h-4 w-4" />,
    'scheduled': <Calendar className="h-4 w-4" />,
    'in-progress': <Play className="h-4 w-4" />,
    'completed': <CheckCircle2 className="h-4 w-4" />,
    'cancelled': <AlertCircle className="h-4 w-4" />
  };

  const urgencyColors = {
    'low': 'bg-blue-100 text-blue-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800'
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
        <FileEdit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No tickets found</h3>
        <p className="text-muted-foreground">
          There are no tickets matching your current filters. Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {tickets.map(ticket => (
        <Card key={ticket.id} className="border border-border/40 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{ticket.title}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Created {formatDate(ticket.created_at)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className={statusColors[ticket.status || 'pending']}>
                  <span className="flex items-center gap-1">
                    {statusIcons[ticket.status || 'pending']}
                    {ticket.status}
                  </span>
                </Badge>
                <Badge variant="outline" className={urgencyColors[ticket.urgency || 'medium']}>
                  {ticket.urgency}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
              {ticket.description}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Technical Areas:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ticket.technical_area && ticket.technical_area.length > 0 ? (
                    ticket.technical_area.map((area, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">None specified</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Budget Range:</span>
                <p className="font-medium">{ticket.budget_range}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Est. Duration:</span>
                <p className="font-medium">{ticket.estimated_duration} minutes</p>
              </div>
              <div>
                <span className="text-muted-foreground">Communication:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ticket.communication_preference && ticket.communication_preference.length > 0 ? (
                    ticket.communication_preference.map((pref, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {pref}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">None specified</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button 
              variant="outline"
              onClick={() => window.location.href = `/get-help/request/${ticket.id}`}
            >
              View Details
            </Button>
            
            {ticket.status === 'pending' || ticket.status === 'matching' ? (
              <Button 
                onClick={() => ticket.id && onClaimTicket(ticket.id)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Claim Ticket
              </Button>
            ) : (
              <Button disabled variant="outline">
                {ticket.status === 'in-progress' ? 'In Progress' : 
                 ticket.status === 'completed' ? 'Completed' : 'Unavailable'}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default TicketList;
