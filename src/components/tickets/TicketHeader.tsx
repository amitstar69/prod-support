
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import type { HelpRequest } from "../../types/helpRequest";

// Placeholder: Replace with your own badge logic as needed
const StatusBadge = ({ status }: { status: string }) => (
  <span className={`
    px-2 py-0.5 rounded text-xs font-medium ml-2
    ${
      status === 'in_progress' ? 'bg-green-100 text-green-700' : 
      status === 'ready_for_qa' ? 'bg-indigo-100 text-indigo-700' :
      status === 'client_review' ? 'bg-orange-100 text-orange-700' :
      status === 'client_approved' ? 'bg-emerald-100 text-emerald-700' :
      status === 'complete' ? 'bg-slate-200 text-slate-900' :
      status === 'cancelled_by_client' ? 'bg-red-100 text-red-700' :
      status === 'pending_match' ? 'bg-blue-100 text-blue-700' :
      'bg-yellow-100 text-yellow-700'
    }
  `}>
    {status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
  </span>
);

// Placeholder for a readable timestamp
const TimeDisplay = ({ timestamp }: { timestamp?: string }) => {
  if (!timestamp) return null;
  try {
    const date = new Date(timestamp);
    return (
      <span className="text-xs text-gray-500 ml-2">
        {date.toLocaleString()}
      </span>
    );
  } catch {
    return null;
  }
};

interface TicketHeaderProps {
  ticket: HelpRequest;
  userRole?: "client" | "developer";
  showHistoryDialog?: () => void;
}

const TicketHeader: React.FC<TicketHeaderProps> = ({
  ticket,
  userRole,
  showHistoryDialog = () => {},
}) => {
  if (!ticket) return null;
  const { id = "", title, status = "", created_at } = ticket;
  const ticketIdDisplay = `HELP-${id.slice(0, 8)}`;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b">
      <div className="flex items-center">
        <Link to="/tickets" className="mr-4 text-primary hover:text-primary/80">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center">
            <span className="text-gray-500 text-sm font-mono mr-2">{ticketIdDisplay}</span>
            <StatusBadge status={status} />
          </div>
          <h1 className="text-2xl font-semibold mt-1">{title}</h1>
        </div>
      </div>
      <div className="flex items-center mt-3 md:mt-0">
        {userRole === "developer" && (
          <Button variant="outline" className="mr-3" onClick={showHistoryDialog}>
            View History
          </Button>
        )}
        <TimeDisplay timestamp={created_at} />
      </div>
    </div>
  );
};

export default TicketHeader;
