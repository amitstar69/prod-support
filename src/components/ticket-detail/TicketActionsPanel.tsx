
import React from 'react';
import DeveloperApplicationPanel from '../../components/developer-ticket-detail/DeveloperApplicationPanel';
import StatusActionCard from './StatusActionCard';

const TicketActionsPanel = ({
  role,
  ticket,
  ticketId,
  userId,
  applicationStatus,
  hasApplied,
  onApply,
  fetchLatestTicketData
}: any) => {
  // Log to help debug why component might not be showing
  console.log('[TicketActionsPanel] Rendering with role:', role, 'ticket status:', ticket?.status);
  
  if (role === "developer") {
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
  if (role === "client") {
    // Always render the StatusActionCard for clients without conditionals that might cause inconsistency
    return (
      <StatusActionCard
        ticket={ticket}
        onStatusUpdated={fetchLatestTicketData}
      />
    );
  }
  return null;
};

export default TicketActionsPanel;
