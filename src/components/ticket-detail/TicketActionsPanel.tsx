
import React from 'react';
import DeveloperApplicationPanel from '../../components/developer-ticket-detail/DeveloperApplicationPanel';
import StatusActionCard from './StatusActionCard';
import { UserType } from '../../utils/helpRequestStatusUtils';

const TicketActionsPanel = ({
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
    // Show developer application panel if they haven't been approved yet
    if (applicationStatus !== "approved" || !hasApplied) {
      return (
        <DeveloperApplicationPanel
          devUpdateVisibility={{
            show: !!(applicationStatus === "approved" && hasApplied),
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
    
    // Show status actions if the developer is approved
    return (
      <StatusActionCard
        ticket={ticket}
        userType={role as UserType}
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
