
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';

const TicketSidebar = require("../../components/developer-ticket-detail/TicketSidebar").default;

const ProjectDetailsCard = ({ ticket, formatDate }: { ticket: HelpRequest, formatDate: (d?: string) => string }) => (
  <TicketSidebar
    ticket={ticket}
    canSubmitQA={false}
    onSubmitQA={() => {}}
    formatDate={formatDate}
  />
);

export default ProjectDetailsCard;
