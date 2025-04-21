
import React from "react";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Badge } from "lucide-react";
import { HelpRequest } from "../../types/helpRequest";
import { getStatusLabel } from "../../utils/helpRequestStatusUtils";

interface TicketHeaderProps {
  onBack: () => void;
  shortTicketId: string;
  ticket: HelpRequest;
}

const TicketHeader: React.FC<TicketHeaderProps> = ({ onBack, shortTicketId, ticket }) => (
  <div className="flex items-center mb-6">
    <Button variant="ghost" onClick={onBack} className="mr-2">
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
    <div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center">
          <span className="rounded bg-blue-50 text-blue-800 border-blue-200 border px-2 py-0.5 text-xs font-medium">{shortTicketId}</span>
        </span>
        {ticket?.status && (
          <span className={`
            rounded border px-2 py-0.5 text-xs font-medium ml-2
            ${
              ticket.status === 'in_progress' ? 'bg-green-50 text-green-800 border-green-200' : 
              ticket.status === 'ready_for_qa' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
              ticket.status === 'client_review' ? 'bg-orange-50 text-orange-800 border-orange-200' :
              ticket.status === 'client_approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              ticket.status === 'complete' ? 'bg-slate-50 text-slate-800 border-slate-200' :
              ticket.status === 'cancelled_by_client' ? 'bg-red-50 text-red-800 border-red-200' :
              ticket.status === 'pending_match' ? 'bg-blue-50 text-blue-800 border-blue-200' :
              'bg-yellow-50 text-yellow-800 border-yellow-200'
            }`
          }>
            {getStatusLabel(ticket.status)}
          </span>
        )}
      </div>
      <h1 className="text-2xl font-bold mt-1">{ticket?.title}</h1>
    </div>
  </div>
);

export default TicketHeader;
