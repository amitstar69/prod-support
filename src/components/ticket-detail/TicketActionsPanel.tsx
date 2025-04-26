
import React from 'react';
import DeveloperApplicationPanel from '../../components/developer-ticket-detail/DeveloperApplicationPanel';
import StatusActionCard from './StatusActionCard';
import DeveloperStatusCard from './DeveloperStatusCard';
import { UserType } from '../../utils/helpRequestStatusUtils';

interface TicketActionsPanelProps {
  role: "developer" | "client";
  ticket: any;
  ticketId: string;
  userId: string;
  applicationStatus: string | null;
  hasApplied: boolean;
  onApply: () => void;
  fetchLatestTicketData: () => Promise<void>;
}

const TicketActionsPanel: React.FC<TicketActionsPanelProps> = ({
  role,
  ticket,
  ticketId,
  userId,
  applicationStatus,
  hasApplied,
  onApply,
  fetchLatestTicketData
}) => {
  // Log to help debug why component might not be showing
  console.log('[TicketActionsPanel] Rendering with role:', role, 'ticket status:', ticket?.status);
  
  if (role === "developer") {
    // Show developer application panel if they haven't applied yet
    if (!hasApplied) {
      return (
        <DeveloperApplicationPanel
          devUpdateVisibility={{
            show: false,
            reason: "",
          }}
          ticket={ticket}
          ticketId={ticketId}
          userType={role}
          applicationStatus={applicationStatus}
          hasApplied={hasApplied}
          onApply={onApply}
          fetchLatestTicketData={fetchLatestTicketData}
        />
      );
    }
    
    // Show developer status card for updating status if they've applied
    return (
      <DeveloperStatusCard
        ticketId={ticketId}
        currentStatus={ticket.status}
        matchStatus={applicationStatus}
        onStatusUpdated={fetchLatestTicketData}
      />
    );
  }

  if (role === "client") {
    // Always render the StatusActionCard for clients
    return (
      <StatusActionCard
        ticket={ticket}
        userType={role as UserType}
        onStatusUpdated={fetchLatestTicketData}
      />
    );
  }
  
  return null;
};

export default TicketActionsPanel;
