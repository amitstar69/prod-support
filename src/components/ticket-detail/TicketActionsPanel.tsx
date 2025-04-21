
import React from "react";
import { HelpRequest } from "../../types/helpRequest";
import DeveloperStatusUpdate from "../help/DeveloperStatusUpdate";
import ClientStatusUpdate from "../help/ClientStatusUpdate";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Info } from "lucide-react";

interface TicketActionsPanelProps {
  ticketId: string;
  ticket: HelpRequest;
  userType: string | null;
  onStatusUpdated: () => void;
}

const TicketActionsPanel: React.FC<TicketActionsPanelProps> = ({
  ticketId,
  ticket,
  userType,
  onStatusUpdated
}) => {
  // Get match status if developer role is assigned to this ticket 
  // (reuse logic from existing pages)

  if (!ticketId || !ticket) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ticket Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {!userType ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You need to be logged in to perform actions on this ticket.
            </AlertDescription>
          </Alert>
        ) : userType === "developer" ? (
          <DeveloperStatusUpdate
            ticketId={ticketId}
            currentStatus={ticket.status}
            onStatusUpdated={onStatusUpdated}
          />
        ) : userType === "client" ? (
          <ClientStatusUpdate
            ticketId={ticketId}
            currentStatus={ticket.status}
            onStatusUpdated={onStatusUpdated}
          />
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your user type does not have permissions to update this ticket.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketActionsPanel;
