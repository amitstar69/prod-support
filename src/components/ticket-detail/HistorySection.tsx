
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';

const TicketHistoryAccordion = require("../tickets/TicketHistoryAccordion").default;

const HistorySection = ({ ticketId, ticket }: { ticketId: string, ticket: HelpRequest }) => (
  <TicketHistoryAccordion helpRequestId={ticket.id} />
);

export default HistorySection;
