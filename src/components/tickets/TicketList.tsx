
import React, { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { useNavigate } from 'react-router-dom';
import DeveloperApplicationModal from '../apply/DeveloperApplicationModal';
import TicketListItem from './TicketListItem';
import AuthRequiredDialog from './AuthRequiredDialog';
import EmptyTicketsView from './EmptyTicketsView';

interface TicketListProps {
  tickets: HelpRequest[];
  onClaimTicket: (ticketId: string) => void;
  currentUserId: string | null;
  isAuthenticated: boolean;
  isRecommended?: boolean;
  isApplication?: boolean;
  onOpenChat?: (helpRequestId: string, clientId: string, clientName?: string) => void;
  viewMode?: 'grid' | 'list';
}

const TicketList: React.FC<TicketListProps> = ({ 
  tickets, 
  onClaimTicket, 
  currentUserId,
  isAuthenticated,
  isRecommended = false,
  isApplication = false,
  onOpenChat,
  viewMode = 'grid'
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
      // For approved tickets viewed on my applications page, navigate to developer ticket detail
      navigate(isApplication ? `/developer/tickets/${ticketId}` : `/developer/tickets/${ticketId}`);
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
  
  const handleChatClick = (helpRequestId: string, clientId: string, clientName?: string) => {
    if (onOpenChat && isAuthenticated) {
      onOpenChat(helpRequestId, clientId, clientName);
    } else if (!isAuthenticated) {
      setPendingAction({ type: 'view', ticketId: helpRequestId });
      setShowAuthDialog(true);
    }
  };
  
  const handleApplicationSuccess = () => {
    // Refresh ticket list
    // This will be implemented by the parent component
  };

  if (tickets.length === 0) {
    return (
      <EmptyTicketsView 
        isApplication={isApplication}
        isRecommended={isRecommended}
      />
    );
  }

  return (
    <>
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-4" 
          : "divide-y divide-border"
      }>
        {tickets.map((ticket) => (
          <TicketListItem
            key={ticket.id}
            ticket={ticket}
            expandedTicket={expandedTicket}
            isRecommended={isRecommended}
            isApplication={isApplication}
            onTicketClick={handleTicketClick}
            onViewDetails={handleViewDetails}
            onClaimClick={handleClaimClick}
            onApplyClick={handleApplyClick}
            onChatClick={onOpenChat ? handleChatClick : undefined}
            viewMode={viewMode}
          />
        ))}
      </div>

      <AuthRequiredDialog
        isOpen={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        actionType={pendingAction?.type || null}
        onLogin={handleLoginPrompt}
        onSignup={handleSignupPrompt}
      />
      
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
