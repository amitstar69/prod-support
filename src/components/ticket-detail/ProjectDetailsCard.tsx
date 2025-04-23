
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import TicketSidebar from "../../components/developer-ticket-detail/TicketSidebar";

const ProjectDetailsCard = ({ ticket, formatDate }: { ticket: HelpRequest, formatDate: (d?: string) => string }) => (
  <TicketSidebar
    ticket={ticket}
    canSubmitQA={false}
    onSubmitQA={() => {}}
    formatDate={formatDate}
  />
);

export default ProjectDetailsCard;
