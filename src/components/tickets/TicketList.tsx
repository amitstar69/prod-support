import React, { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ExternalLink, ArrowUpRight, Clock, DollarSign, Zap, CheckCircle, AlertCircle } from 'lucide-react';
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
import DeveloperApplicationModal from '../apply/DeveloperApplicationModal';

interface TicketListProps {
  tickets: HelpRequest[];
  onClaimTicket: (ticketId: string) => void;
  currentUserId: string | null;
  isAuthenticated: boolean;
  isRecommended?: boolean;
  isApplication?: boolean;
}

const TicketList: React.FC<TicketListProps> = ({ 
  tickets, 
  onClaimTicket, 
  currentUserId,
  isAuthenticated,
  isRecommended = false,
  isApplication = false
}) => {
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'view' | 'claim' | 'apply', ticketId: string } | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpRequest | null>(null);

  const handleLoginPrompt = () => {
    navigate('/login', { state: { returnTo: '/developer-dashboard' } });
    setShowAuthDialog(false);
  };

  const handleSignupPrompt = () => {
    navigate('/register', { state: { returnTo: '/developer-dashboard' } });
    setShowAuthDialog(false);
  };

  const handleTicketClick = (ticketId: string) => {
    if (expandedTicket === ticketId) {
      setExpandedTicket(null);
    } else {
      setExpandedTicket(ticketId);
    }
  };

  const handleViewDetails = (ticketId: string) => {
    if (isAuthenticated) {
      navigate(`/developer/tickets/${ticketId}`);
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
  
  const handleApplyClick = (ticket: HelpRequest) => {
    if (isAuthenticated) {
      setSelectedTicket(ticket);
      setShowApplicationModal(true);
    } else {
      setPendingAction({ type: 'apply', ticketId: ticket.id || '' });
      setShowAuthDialog(true);
    }
  };
  
  const handleApplicationSuccess = () => {
    // Refresh ticket list
    // This will be implemented by the parent component
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
        <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
        <h3 className="text-xl font-medium mb-2">No tickets found</h3>
        <p className="text-muted-foreground">
          {isApplication 
            ? "You haven't applied to any tickets yet. Browse available tickets and start applying!" 
            : isRecommended
              ? "No recommended tickets found. We'll suggest tickets that match your skills as they become available."
              : "There are no tickets matching your current filters. Try adjusting your filters or check back later."}
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
      case 'resolved': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'completed': return 'bg-slate-50 text-slate-800 border-slate-200';
      case 'cancelled': return 'bg-red-50 text-red-800 border-red-200';
      case 'matching': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'scheduled': return 'bg-purple-50 text-purple-800 border-purple-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {tickets.map((ticket) => {
          const ticketKey = ticket.ticket_number ? 
            `TICKET-${ticket.ticket_number}` : 
            `TICKET-${Math.floor(Math.random() * 900) + 100}`;
            
          const isExpanded = expandedTicket === ticket.id;
          
          const isRecommendedTicket = isRecommended;
          
          const hasApplicationStatus = isApplication;
            
          return (
            <div 
              key={ticket.id} 
              className={`bg-white border border-border/20 rounded-lg overflow-hidden transition-all duration-200 ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'} ${isRecommendedTicket ? 'ring-2 ring-primary/20' : ''}`}
            >
              {isRecommendedTicket && (
                <div className="bg-primary/10 text-primary text-xs py-1 px-3 text-center font-medium">
                  Recommended for your skills
                </div>
              )}
              
              <div 
                className="p-4 cursor-pointer"
                onClick={() => handleTicketClick(ticket.id || '')}
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
                    {ticket.status || 'open'}
                  </Badge>
                </div>
                
                {hasApplicationStatus && (
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
                          ticket.id && handleViewDetails(ticket.id);
                        }}
                      >
                        View Details
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </Button>
                      
                      {(ticket.status === 'open') ? (
                        <Button 
                          size="sm"
                          className="h-8 bg-primary text-white hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyClick(ticket);
                          }}
                        >
                          Apply
                          <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      ) : ticket.status === 'claimed' ? (
                        <Button 
                          size="sm"
                          className="h-8 bg-primary text-white hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            ticket.id && handleClaimClick(ticket.id);
                          }}
                        >
                          Start Work
                          <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          disabled 
                          variant="outline"
                          className="h-8"
                        >
                          {ticket.status === 'in-progress' ? 'In Progress' : 
                          ticket.status === 'resolved' ? 'Resolved' :
                          ticket.status === 'completed' ? 'Completed' : 'Unavailable'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              {pendingAction?.type === 'view' 
                ? 'You need to sign in to view this ticket\'s details.'
                : pendingAction?.type === 'apply'
                ? 'You need to sign in as a developer to apply for this ticket.'
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
                : 'Only registered developers can work on tickets.'}
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
      
      {selectedTicket && (
        <DeveloperApplicationModal 
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          ticket={selectedTicket}
          onApplicationSuccess={handleApplicationSuccess}
        />
      )}
    </>
  );
};

export default TicketList;
