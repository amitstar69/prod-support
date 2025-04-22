
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { HelpRequest } from "../../types/helpRequest";
import { toast } from "sonner";
import { updateHelpRequest } from "../../integrations/supabase/helpRequestsCore/updateHelpRequest";
import { supabase } from "../../integrations/supabase/client";
import { Check, X } from "lucide-react";

type ClientActionsPanelProps = {
  ticket: HelpRequest;
  userId: string;
  onStatusUpdated?: (newStatus: string) => void;
};

const statusActions: Record<
  string,
  { label: string; newStatus: string; icon?: React.ReactNode }[]
> = {
  awaiting_client_approval: [
    {
      label: "Approve Developer",
      newStatus: "approved",
      icon: <Check className="w-4 h-4 mr-1" />,
    },
    {
      label: "Reject Developer",
      newStatus: "rejected",
      icon: <X className="w-4 h-4 mr-1" />,
    },
  ],
  ready_for_client_qa: [
    {
      label: "QA Pass",
      newStatus: "qa_pass",
      icon: <Check className="w-4 h-4 mr-1" />,
    },
    {
      label: "QA Fail",
      newStatus: "qa_fail",
      icon: <X className="w-4 h-4 mr-1" />,
    },
  ],
  ready_for_final_action: [
    {
      label: "Mark Resolved",
      newStatus: "resolved",
      icon: <Check className="w-4 h-4 mr-1" />,
    },
  ],
};

const ALLOWED_STATUSES = [
  "awaiting_client_approval",
  "ready_for_client_qa",
  "ready_for_final_action"
];

const ClientActionsPanel: React.FC<ClientActionsPanelProps> = ({
  ticket,
  userId,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  // Only show panel if allowed
  if (!ticket.status || !ALLOWED_STATUSES.includes(ticket.status)) return null;

  const availableActions = statusActions[ticket.status] || [];

  const handleAction = async (newStatus: string) => {
    setLoading(newStatus);
    try {
      // Update the ticket's status
      const updateRes = await updateHelpRequest(
        ticket.id!,
        { status: newStatus },
        "client"
      );
      if (!updateRes.success) {
        toast.error(updateRes.error || "Could not update ticket status");
        setLoading(null);
        return;
      }
      // Insert into help_request_history
      const { error: historyErr } = await supabase
        .from("help_request_history")
        .insert({
          help_request_id: ticket.id,
          change_type: "status_transition",
          previous_status: ticket.status,
          new_status: newStatus,
          changed_by: userId,
          change_details: { role: "client" },
        });
      if (historyErr) {
        toast.error("Status updated but failed logging to history.");
      } else {
        toast.success("Status updated!");
      }
      onStatusUpdated?.(newStatus);
    } catch (err: any) {
      toast.error(
        err?.message || "Unexpected error. Please try again or refresh."
      );
    }
    setLoading(null);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Client Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {availableActions.map((action) => (
            <Button
              key={action.newStatus}
              variant="outline"
              disabled={!!loading}
              className="w-full flex items-center"
              onClick={() => handleAction(action.newStatus)}
            >
              {action.icon}
              {loading === action.newStatus ? "Processing..." : action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientActionsPanel;
