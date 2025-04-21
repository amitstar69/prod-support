
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { HelpRequest } from "../../types/helpRequest";
import { formatDistance } from "date-fns";

interface TicketSidebarProps {
  ticket: HelpRequest;
  userType: string | null;
}

const TicketSidebar: React.FC<TicketSidebarProps> = ({ ticket, userType }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-6">
      {/* Ticket Details Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Ticket Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Created</div>
              <div>{formatDate(ticket.created_at)}</div>
            </div>

            {ticket.updated_at !== ticket.created_at && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                <div>{formatDate(ticket.updated_at)}</div>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-muted-foreground">Budget</div>
              <div>{ticket.budget_range || "Not specified"}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">Urgency</div>
              <div className="capitalize">{ticket.urgency || "Not specified"}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Estimated Duration
              </div>
              <div>
                {ticket.estimated_duration
                  ? `${ticket.estimated_duration} minute${
                      ticket.estimated_duration !== 1 ? "s" : ""
                    }`
                  : "Not specified"}
              </div>
            </div>

            {ticket.communication_preference && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Communication Preference
                </div>
                <div className="flex flex-wrap gap-1">
                  {ticket.communication_preference.map((pref, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional cards can be conditionally rendered based on userType */}
      {userType === "client" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Developer Information</CardTitle>
          </CardHeader>
          <CardContent>
            {/* We would display assigned developer info here if available */}
            <p className="text-muted-foreground text-sm">
              {ticket.status === "pending_match"
                ? "No developer has been assigned yet."
                : "Developer details will appear here once assigned."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketSidebar;
