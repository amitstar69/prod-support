
import React from 'react';
import DeveloperApplicationPanel from '../../components/developer-ticket-detail/DeveloperApplicationPanel';
import StatusActionCard from './StatusActionCard';
import { UserType } from '../../utils/helpRequestStatusUtils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Bug } from 'lucide-react';

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
  console.log('[TicketActionsPanel] Rendering with role:', role, 'ticket status:', ticket?.status, 
    'applicationStatus:', applicationStatus, 'hasApplied:', hasApplied);
  
  // Safety check for missing data
  if (!ticket) {
    return (
      <Alert variant="destructive">
        <Bug className="h-4 w-4" />
        <AlertTitle>Error rendering actions</AlertTitle>
        <AlertDescription>Ticket data is missing or incomplete</AlertDescription>
      </Alert>
    );
  }
  
  if (role === "developer") {
    // Show developer application panel if they haven't been approved yet
    if (applicationStatus !== "approved" || !hasApplied) {
      console.log('[TicketActionsPanel] Showing DeveloperApplicationPanel for non-approved developer');
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
    console.log('[TicketActionsPanel] Showing StatusActionCard for approved developer');
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
    console.log('[TicketActionsPanel] Showing StatusActionCard for client');
    return (
      <StatusActionCard
        ticket={ticket}
        userType={role as UserType}
        onStatusUpdated={fetchLatestTicketData}
      />
    );
  }
  
  console.log('[TicketActionsPanel] No matching role found:', role);
  return null;
};

export default TicketActionsPanel;
