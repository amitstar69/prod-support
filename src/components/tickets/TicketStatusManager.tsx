
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatStatusLabel, getAllowedStatusTransitions } from "../../utils/ticketStatusUtils";
import { getStatusLabel } from "../../utils/helpRequestStatusUtils";
import type { HelpRequest } from "../../types/helpRequest";

/**
 * Props:
 * - ticket: HelpRequest object
 * - userRole: "client" | "developer"
 * - onStatusUpdate: (ticketId: string, newStatus: string) => Promise<void>
 */
type Props = {
  ticket: HelpRequest;
  userRole: "client" | "developer";
  onStatusUpdate: (ticketId: string, status: string) => Promise<void>;
};

const formatStatus = (status?: string) => {
  return getStatusLabel(status || "");
};

const TicketStatusManager: React.FC<Props> = ({
  ticket,
  userRole,
  onStatusUpdate,
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(ticket.status || "");

  // Determine possible status transitions based on userRole and ticket.status:
  const statusOptions = useMemo(() => {
    if (!ticket.status || !userRole) return [];
    // Use utility to get allowed transitions (underscore for normalization)
    return getAllowedStatusTransitions(
      ticket.status.replace(/-/g, "_"),
      userRole
    );
  }, [ticket.status, userRole]);

  const handleUpdate = useCallback(async () => {
    if (selectedStatus === ticket.status) return;
    setUpdatingStatus(true);
    try {
      await onStatusUpdate(ticket.id as string, selectedStatus);
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update status"
      );
      setSelectedStatus(ticket.status || "");
    } finally {
      setUpdatingStatus(false);
    }
  }, [selectedStatus, ticket, onStatusUpdate]);

  if (!ticket || !ticket.status) return null;

  return (
    <div className="bg-muted p-4 rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-3">
        Status:{" "}
        <span className="font-bold">{formatStatus(ticket.status)}</span>
      </h3>
      {statusOptions.length > 0 && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            {userRole === "developer" ? "Update Status" : "Change Request Status"}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              disabled={updatingStatus}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleUpdate}
              disabled={
                selectedStatus === ticket.status || updatingStatus || !selectedStatus
              }
              isLoading={updatingStatus}
              className="ml-1"
              type="button"
            >
              Update
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketStatusManager;

/**
 * Utility for formatting status label for fallback, if you want to display label more readably.
 * Not used if getStatusLabel already imported.
 */
export function formatStatusLabel(status?: string): string {
  if (!status) return "";
  return status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
