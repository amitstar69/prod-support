
import React, { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

interface TicketListProps {
  tickets: HelpRequest[];
  onClaimTicket: (ticketId: string) => void;
  currentUserId: string | null;
  isAuthenticated: boolean;
}

const TicketList: React.FC<TicketListProps> = ({ 
  tickets, 
  onClaimTicket, 
  currentUserId,
  isAuthenticated 
}) => {
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'view' | 'claim', ticketId: string } | null>(null);

  const handleLoginPrompt = () => {
    navigate('/login', { state: { returnTo: '/developer-dashboard' } });
    setShowAuthDialog(false);
  };

  const handleSignupPrompt = () => {
    navigate('/register', { state: { returnTo: '/developer-dashboard' } });
    setShowAuthDialog(false);
  };

  const handleTicketClick = (ticketId: string) => {
    if (isAuthenticated) {
      navigate(`/get-help/request/${ticketId}`);
    } else {
      setPendingAction({ type: 'view', ticketId });
      setShowAuthDialog(true);
    }
  };

  const handleClaimClick = (ticketId: string) => {
    if (isAuthenticated) {
      onClaimTicket(ticketId);
    } else {
      setPendingAction({ type: 'claim', ticketId });
      setShowAuthDialog(true);
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
        <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
        <h3 className="text-xl font-medium mb-2">No tickets found</h3>
        <p className="text-muted-foreground">
          There are no tickets matching your current filters. Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <>
      <div className="overflow-hidden border border-border/40 rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-foreground/70">Key</th>
              <th className="px-4 py-3 text-left font-medium text-foreground/70 w-[30%]">Title</th>
              <th className="px-4 py-3 text-left font-medium text-foreground/70">Technical Area</th>
              <th className="px-4 py-3 text-left font-medium text-foreground/70">Urgency</th>
              <th className="px-4 py-3 text-left font-medium text-foreground/70">Status</th>
              <th className="px-4 py-3 text-left font-medium text-foreground/70">Created</th>
              <th className="px-4 py-3 text-left font-medium text-foreground/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => {
              // Create a simple key from the id or index (like HELP-123)
              const ticketKey = ticket.id ? 
                `HELP-${ticket.id.substring(0, 3)}` : 
                `HELP-${index + 100}`;
                
              return (
                <tr 
                  key={ticket.id || index} 
                  className="border-t border-border/20 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <a 
                      onClick={(e) => {
                        e.preventDefault();
                        ticket.id && handleTicketClick(ticket.id);
                      }}
                      href="#"
                      className="text-primary hover:underline cursor-pointer"
                    >
                      {ticketKey}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <a 
                      onClick={(e) => {
                        e.preventDefault();
                        ticket.id && handleTicketClick(ticket.id);
                      }}
                      href="#"
                      className="hover:text-primary hover:underline transition-colors cursor-pointer"
                    >
                      {ticket.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {ticket.technical_area && ticket.technical_area.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ticket.technical_area.slice(0, 1).map((area, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                            {area}
                          </Badge>
                        ))}
                        {ticket.technical_area.length > 1 && (
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">
                            +{ticket.technical_area.length - 1}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${ticket.urgency === 'high' ? 'bg-orange-50 text-orange-800 border-orange-200' : 
                          ticket.urgency === 'critical' ? 'bg-red-50 text-red-800 border-red-200' :
                          ticket.urgency === 'medium' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                          'bg-blue-50 text-blue-800 border-blue-200'}
                      `}
                    >
                      {ticket.urgency || 'low'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge 
                      variant="outline"
                      className={`
                        ${ticket.status === 'in-progress' ? 'bg-green-50 text-green-800 border-green-200' : 
                          ticket.status === 'completed' ? 'bg-slate-50 text-slate-800 border-slate-200' :
                          ticket.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                          'bg-yellow-50 text-yellow-800 border-yellow-200'}
                      `}
                    >
                      {ticket.status || 'pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(ticket.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {(ticket.status === 'pending' || ticket.status === 'matching') ? (
                      <Button 
                        size="sm"
                        onClick={() => ticket.id && handleClaimClick(ticket.id)}
                        className="h-8 px-3 bg-primary text-white hover:bg-primary/90"
                      >
                        Claim
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        disabled 
                        variant="outline"
                        className="h-8 px-3"
                      >
                        {ticket.status === 'in-progress' ? 'In Progress' : 
                        ticket.status === 'completed' ? 'Completed' : 'Unavailable'}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              {pendingAction?.type === 'view' 
                ? 'You need to sign in to view this ticket\'s details.'
                : 'You need to sign in as a developer to claim this ticket.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Please sign in to your existing account or create a new developer account to continue.
            </p>
            <p className="text-sm text-muted-foreground">
              {pendingAction?.type === 'view' 
                ? 'Viewing ticket details requires an account to protect client privacy.'
                : 'Only registered developers can claim and work on tickets.'}
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button onClick={handleLoginPrompt} className="flex-1 sm:flex-none">
              Sign In
            </Button>
            <Button onClick={handleSignupPrompt} variant="outline" className="flex-1 sm:flex-none">
              Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TicketList;
