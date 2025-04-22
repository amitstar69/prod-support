
import React from 'react';

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
  // Use prop drilling, don't import external dependencies beyond what's required here
  // The imported components are handled by the parent
  if (role === "developer") {
    const DeveloperApplicationPanel = require('../../developer-ticket-detail/DeveloperApplicationPanel').default;
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
    const ClientActionsPanel = require("../tickets/ClientActionsPanel").default;
    return (
      <ClientActionsPanel
        ticket={ticket}
        userId={userId}
        onStatusUpdated={fetchLatestTicketData}
      />
    );
  }
  return null;
};

export default TicketActionsPanel;

