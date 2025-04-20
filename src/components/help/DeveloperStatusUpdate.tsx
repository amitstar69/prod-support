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
import { Loader2, CheckCircle2, ArrowRightCircle, ClipboardCheck, UserCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { 
  getAllowedStatusTransitions, 
  getStatusLabel, 
  STATUSES,
  getStatusDescription 
} from '../../utils/helpRequestStatusUtils';
import { HelpRequest } from '../../types/helpRequest';

interface DeveloperStatusUpdateProps {
  ticketId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

const DeveloperStatusUpdate: React.FC<DeveloperStatusUpdateProps> = ({
  ticketId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const { userType, userId } = useAuth();
  const [availableStatuses, setAvailableStatuses] = useState<Array<{value: string, label: string}>>([]);
  const [nextStatus, setNextStatus] = useState<string | null>(null);

  useEffect(() => {
    const logDebugInfo = async () => {
      if (!currentStatus || !ticketId) return;
      
      console.log("DeveloperStatusUpdate debug info:");
      console.log("- Current status:", currentStatus);
      console.log("- Current user type:", userType);
      console.log("- Current user ID:", userId);
      
      try {
        // Check if developer is matched with this request
        const { data: matchData } = await supabase
          .from('help_request_matches')
          .select('status')
          .eq('request_id', ticketId)
          .eq('developer_id', userId)
          .maybeSingle();
          
        console.log("- Developer match status:", matchData?.status || "No match found");
      } catch (error) {
        console.error("Error checking match status:", error);
      }
    };
    
    logDebugInfo();
  }, [currentStatus, ticketId, userType, userId]);

  useEffect(() => {
    if (!currentStatus || userType !== 'developer') return;
    
    console.log("Getting available transitions for status:", currentStatus);
    
    // Define manual transitions based on current status
    let allowedTransitions: string[] = [];
    
    // Hardcoded status transitions to ensure they work properly
    switch (currentStatus) {
      case 'approved':
        allowedTransitions = ['in_progress'];
        break;
      case 'in_progress':
        allowedTransitions = ['ready_for_qa'];
        break;
      case 'ready_for_qa':
        // No transitions from here, this is handled by the QA dialog
        allowedTransitions = [];
        break;
      case 'pending_match':
        allowedTransitions = ['dev_requested'];
        break;
      default:
        // Try to use the helper function as fallback
        allowedTransitions = getAllowedStatusTransitions(currentStatus, 'developer');
    }
    
    console.log("Available status transitions:", allowedTransitions);
    
    // Set available statuses
    const statusOptions = allowedTransitions.map(status => ({
      value: status,
      label: getStatusLabel(status)
    }));
    
    setAvailableStatuses(statusOptions);
    
    // Set next logical status if available
    if (allowedTransitions.length > 0) {
      setNextStatus(allowedTransitions[0]);
      setSelectedStatus(allowedTransitions[0]);
    } else {
      setNextStatus(null);
    }
  }, [currentStatus, userType]);

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      toast.info('Status is already set to ' + getStatusLabel(selectedStatus));
      return;
    }

    setIsUpdating(true);
    setError(null);
    
    try {
      console.log(`Updating ticket ${ticketId} status from ${currentStatus} to ${selectedStatus}`);
      
      const response = await updateHelpRequest(
        ticketId,
        { status: selectedStatus },
        userType || 'developer'
      );

      if (response.success) {
        toast.success(`Ticket status updated to ${getStatusLabel(selectedStatus)}`);
        onStatusUpdated();
      } else {
        setError(response.error || 'Failed to update status');
        toast.error(response.error || 'Failed to update status');
        console.error('Status update error details:', response);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
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
      console.log(`Quick updating ticket ${ticketId} status to ${nextStatus}`);
      
      const response = await updateHelpRequest(
        ticketId,
        { status: nextStatus },
        userType || 'developer'
      );

      if (response.success) {
        toast.success(`Ticket status updated to ${getStatusLabel(nextStatus)}`);
        onStatusUpdated();
      } else {
        setError(response.error || 'Failed to update status');
        toast.error(response.error || 'Failed to update status');
        console.error('Quick update error details:', response);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('An error occurred while updating the status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case STATUSES.IN_PROGRESS:
        return <ArrowRightCircle className="h-4 w-4" />;
      case STATUSES.READY_FOR_QA:
        return <ClipboardCheck className="h-4 w-4" />;
      case STATUSES.DEV_REQUESTED:
        return <UserCheck className="h-4 w-4" />;
      case STATUSES.COMPLETE:
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getNextStatusButtonText = (status: string): string => {
    switch (status) {
      case STATUSES.PENDING_MATCH:
        return 'Request Assignment';
      case STATUSES.APPROVED:
        return 'Start Working';
      case STATUSES.IN_PROGRESS:
        return 'Submit for QA';
      default:
        return 'Update Status';
    }
  };

  if (availableStatuses.length === 0) {
    return null;
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
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              getStatusIcon(nextStatus)
            )}
            <span className="ml-2">{getNextStatusButtonText(currentStatus)}</span>
          </Button>
        </div>
      ) : (
        <Alert>
          <AlertTitle>No Available Status Updates</AlertTitle>
          <AlertDescription>
            {currentStatus === 'ready_for_qa' 
              ? "You've submitted this work for QA. Waiting for client review." 
              : "No status transitions available at this time."}
          </AlertDescription>
        </Alert>
      )}

      {availableStatuses.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="w-full sm:w-2/3">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              disabled={isUpdating || availableStatuses.length === 0}
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
            disabled={isUpdating || selectedStatus === currentStatus || availableStatuses.length === 0}
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

export default DeveloperStatusUpdate;
