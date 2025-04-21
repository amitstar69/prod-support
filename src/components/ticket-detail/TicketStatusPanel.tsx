
import React from "react";
import { HelpRequest } from "../../types/helpRequest";
import RequestStatusFlow from "../help/RequestStatusFlow";

interface TicketStatusPanelProps {
  ticket: HelpRequest;
}

const TicketStatusPanel: React.FC<TicketStatusPanelProps> = ({ ticket }) => (
  <div className="mb-6">
    <RequestStatusFlow currentStatus={ticket.status} />
  </div>
);

export default TicketStatusPanel;
