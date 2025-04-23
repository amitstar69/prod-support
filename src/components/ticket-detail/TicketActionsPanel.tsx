
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
