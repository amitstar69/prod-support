
import React, { useState, useEffect } from 'react';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Loader2, CheckCircle2, ArrowRightCircle, ArrowUpLeft, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { 
  getAllowedStatusTransitions, 
  getStatusLabel, 
  STATUSES,
  getStatusDescription
} from '../../utils/helpRequestStatusUtils';

interface ClientStatusUpdateProps {
  ticketId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

const ClientStatusUpdate: React.FC<ClientStatusUpdateProps> = ({
  ticketId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const { userType } = useAuth();
  const [availableStatuses, setAvailableStatuses] = useState<Array<{ value: string; label: string }>>([]);
  const [nextStatus, setNextStatus] = useState<string | null>(null);

  useEffect(() => {
    // Only STATUS_TRANSITIONS + helpers control transitions now
    const transitions = getAllowedStatusTransitions(currentStatus, 'client');
    setAvailableStatuses(
      transitions.map(status => ({
        value: status,
        label: getStatusLabel(status)
      }))
    );
    setNextStatus(transitions.length ? transitions[0] : null);
    setSelectedStatus(transitions.length ? transitions[0] : currentStatus);
  }, [currentStatus]);

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      toast.info(`Status is already set to ${getStatusLabel(selectedStatus)}`);
      return;
    }
    setIsUpdating(true);
    setError(null);

    try {
      const response = await updateHelpRequest(
        ticketId,
        { status: selectedStatus },
        userType || 'client'
      );
      if (response.success) {
        toast.success(`Ticket status updated to ${getStatusLabel(selectedStatus)}`);
        onStatusUpdated();
      } else {
        setError(response.error || 'Failed to update status');
        toast.error(response.error || 'Permission denied: cannot update status');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('An error occurred while updating the status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickUpdate = async () => {
    if (!nextStatus) {
      toast.error('No valid next status available');
      return;
    }
    setSelectedStatus(nextStatus);
    setIsUpdating(true);
    setError(null);
    try {
      const response = await updateHelpRequest(
        ticketId,
        { status: nextStatus },
        userType || 'client'
      );
      if (response.success) {
        toast.success(`Ticket status updated to ${getStatusLabel(nextStatus)}`);
        onStatusUpdated();
      } else {
        setError(response.error || 'Failed to update status');
        toast.error(response.error || 'Permission denied: cannot update status');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('An error occurred while updating the status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove all switch statements; single source of truth for icons/text
  const getStatusIcon = (status: string) => {
    if (status === STATUSES.APPROVED) return <CheckCircle2 className="h-4 w-4" />;
    if (status === STATUSES.COMPLETE) return <CheckCircle2 className="h-4 w-4" />;
    if (status === STATUSES.QA_FEEDBACK) return <ArrowUpLeft className="h-4 w-4" />;
    if (status === STATUSES.CANCELLED_BY_CLIENT) return <ArrowUpLeft className="h-4 w-4" />;
    return <ArrowRightCircle className="h-4 w-4" />;
  };

  const getNextStatusButtonText = (nextStatus: string | null): string => {
    if (!nextStatus) return 'Update Status';
    if (nextStatus === STATUSES.APPROVED) return 'Approve Developer';
    if (nextStatus === STATUSES.COMPLETE) return 'Mark as Complete';
    if (nextStatus === STATUSES.QA_FEEDBACK) return 'Request Changes';
    if (nextStatus === STATUSES.CANCELLED_BY_CLIENT) return 'Cancel Request';
    return getStatusLabel(nextStatus);
  };

  // No transitions: UI fallback (centralized logic to avoid visibility bugs)
  if (!availableStatuses.length) {
    return (
      <Alert>
        <AlertTitle>No Available Status Updates</AlertTitle>
        <AlertDescription>
          No status transitions available at this time.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {nextStatus ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleQuickUpdate}
            disabled={isUpdating}
            className="w-full"
            variant={nextStatus === STATUSES.CANCELLED_BY_CLIENT ? "destructive" : "default"}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              getStatusIcon(nextStatus)
            )}
            <span className="ml-2">{getNextStatusButtonText(nextStatus)}</span>
          </Button>
        </div>
      ) : (
        <Alert>
          <AlertTitle>No Available Status Updates</AlertTitle>
          <AlertDescription>
            No status transitions available at this time.
          </AlertDescription>
        </Alert>
      )}

      {availableStatuses.length > 1 && (
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="w-full sm:w-2/3">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center">
                      {getStatusIcon(status.value)}
                      <span className="ml-2">{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={handleUpdateStatus}
            disabled={isUpdating || selectedStatus === currentStatus}
            className="w-full sm:w-1/3"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              'Update'
            )}
          </Button>
        </div>
      )}

      <div className="mt-4 bg-muted p-3 rounded text-sm">
        <p className="font-medium">Current Status: {getStatusLabel(currentStatus)}</p>
        <p className="text-muted-foreground text-xs mt-1">{getStatusDescription(currentStatus)}</p>
      </div>
    </div>
  );
};

export default ClientStatusUpdate;

