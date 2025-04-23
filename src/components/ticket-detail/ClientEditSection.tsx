
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import TicketSidebar from "../../components/developer-ticket-detail/TicketSidebar";

const ClientEditSection = ({
  visible,
  status,
  ticket,
  onTicketUpdated,
  canSubmitQA,
  onSubmitQA,
  formatDate
}: {
  visible: boolean;
  status: string;
  ticket: HelpRequest;
  onTicketUpdated?: (ticket: HelpRequest) => void;
  canSubmitQA?: boolean;
  onSubmitQA?: () => void;
  formatDate: (date?: string) => string;
}) => {
  if (!visible) return null;
  
  return (
    <>
      {/* Project details sidebar - no longer includes the StatusActionCard */}
      <TicketSidebar
        ticket={ticket}
        canSubmitQA={canSubmitQA || false}
        onSubmitQA={onSubmitQA || (() => {})}
        formatDate={formatDate}
        onTicketUpdated={onTicketUpdated}
      />
    </>
  );
};

export default ClientEditSection;
