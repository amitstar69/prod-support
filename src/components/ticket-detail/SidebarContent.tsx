
import React from 'react';
import DeveloperApplicationPanel from '../developer-ticket-detail/DeveloperApplicationPanel';
import StatusActionCard from './StatusActionCard';
import TicketHistoryPanel from './TicketHistoryPanel';
import { HelpRequest } from '../../types/helpRequest';

interface SidebarContentProps {
  isDeveloper: boolean;
  ticket: HelpRequest;
  ticketId: string;
  applicationStatus: string | null;
  hasApplied: boolean;
  onApply: () => void;
  onRefresh: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  isDeveloper,
  ticket,
  ticketId,
  applicationStatus,
  hasApplied,
  onApply,
  onRefresh
}) => {
  return (
    <div className="space-y-6">
      {isDeveloper && ticket && (
        <DeveloperApplicationPanel
          devUpdateVisibility={{
            show: !!(applicationStatus === "approved" && hasApplied),
            reason: "",
          }}
          ticket={ticket}
          ticketId={ticketId}
          userType={isDeveloper ? "developer" : "client"}
          applicationStatus={applicationStatus}
          hasApplied={hasApplied}
          onApply={onApply}
          fetchLatestTicketData={onRefresh}
        />
      )}
      
      {ticket && (
        <StatusActionCard
          ticket={ticket}
          userType={isDeveloper ? "developer" : "client"}
          onStatusUpdated={onRefresh}
        />
      )}
      
      <TicketHistoryPanel 
        ticketId={ticketId} 
        compact={true} 
        limit={5} 
      />
    </div>
  );
};

export default SidebarContent;
