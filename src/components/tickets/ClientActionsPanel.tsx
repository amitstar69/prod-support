
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { HelpRequest } from "../../types/helpRequest";
import { toast } from "sonner";
import { updateHelpRequest } from "../../integrations/supabase/helpRequestsCore/updateHelpRequest";
import { supabase } from "../../integrations/supabase/client";
import { Check, X, ArrowRight } from "lucide-react";
import StatusDropdown from "../developer-actions/StatusDropdown";
import { getAllowedStatusTransitions } from "../../utils/helpRequestStatusUtils";
import { TicketStatus } from "../../types/enums";

// This component is not directly used in the ticket detail view anymore
// It's kept for backwards compatibility with other parts of the application
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
  "submitted",
  "pending_match",
  "dev_requested",
  "awaiting_client_approval",
  "approved",
  "requirements_review",
  "need_more_info",
  "in_progress",
  "ready_for_client_qa",
  "qa_fail", 
  "qa_pass",
  "ready_for_final_action"
];

const ClientActionsPanel: React.FC<ClientActionsPanelProps> = ({
  ticket,
  userId,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>(ticket.status || "");

  const currentStatus = ticket.status || '';
  const availableActions = statusActions[currentStatus] || [];
  const allowedTransitions = getAllowedStatusTransitions(currentStatus, 'client');

  const handleAction = async (newStatus: string) => {
    setLoading(newStatus);
    try {
      const updateRes = await updateHelpRequest(
        ticket.id!,
        { status: newStatus as TicketStatus },
        "client"
      );
      if (!updateRes.success) {
        toast.error(updateRes.error || "Could not update ticket status");
        setLoading(null);
        return;
      }
      
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

  const handleStatusChange = async () => {
    if (selectedStatus === ticket.status) {
      toast.info("No change in status selected");
      return;
    }
    
    await handleAction(selectedStatus);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Client Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Update Status</span>
              {ticket.status && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            
            <StatusDropdown
              defaultStatusId={selectedStatus}
              onStatusChange={setSelectedStatus}
              placeholder="Select new status"
              required={true}
              userType="client"
            />
            
            <Button
              onClick={handleStatusChange}
              disabled={!!loading || selectedStatus === ticket.status || !allowedTransitions.includes(selectedStatus)}
              className="w-full"
            >
              {loading === selectedStatus ? "Updating..." : "Update Status"}
            </Button>
          </div>
          
          {availableActions.length > 0 && (
            <>
              <div className="h-px w-full bg-border my-2" />
              <div className="space-y-2">
                <span className="text-sm font-medium">Quick Actions</span>
                <div className="flex flex-col gap-2">
                  {availableActions.map((action) => (
                    <Button
                      key={action.newStatus}
                      variant="outline"
                      disabled={!!loading}
                      className="w-full flex items-center justify-center"
                      onClick={() => handleAction(action.newStatus as TicketStatus)}
                    >
                      {action.icon}
                      {loading === action.newStatus ? "Processing..." : action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientActionsPanel;
