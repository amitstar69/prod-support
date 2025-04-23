
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import TicketHistoryAccordion from "../tickets/TicketHistoryAccordion";

const HistorySection = ({ ticketId, ticket }: { ticketId: string, ticket: HelpRequest }) => (
  <TicketHistoryAccordion helpRequestId={ticket.id} />
);

export default HistorySection;
