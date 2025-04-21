
import React, { useState, useEffect } from 'react';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { supabase } from '../../integrations/supabase/client';
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
  const [matchStatus, setMatchStatus] = useState<string | null>(null);
  const [isPermissionChecking, setIsPermissionChecking] = useState<boolean>(true);
  
  useEffect(() => {
    const checkDeveloperPermission = async () => {
      if (!ticketId || !userId) {
        setIsPermissionChecking(false);
        return;
      }
      
      setIsPermissionChecking(true);
      
      try {
        // Check if developer is matched with this request
        const { data: matchData, error } = await supabase
          .from('help_request_matches')
          .select('status')
          .eq('request_id', ticketId)
          .eq('developer_id', userId)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking match status:", error);
          setMatchStatus(null);
        } else if (matchData) {
          setMatchStatus(matchData.status);
          console.log("Developer match status:", matchData.status);
        } else {
          setMatchStatus(null);
        }
      } catch (error) {
        console.error("Exception checking match status:", error);
        setMatchStatus(null);
      } finally {
        setIsPermissionChecking(false);
      }
    };
    
    checkDeveloperPermission();
    
  }, [ticketId, userId]);

  useEffect(() => {
    // Always get allowed transitions from centralized helper
    const transitions = getAllowedStatusTransitions(currentStatus, 'developer');
    
    // Filter transitions further based on match status
    let filteredTransitions = [...transitions];
    
    if (matchStatus !== 'approved' && matchStatus !== null) {
      // Only allow dev_requested and abandoned_by_dev for non-approved matches
      filteredTransitions = filteredTransitions.filter(
        status => status === STATUSES.DEV_REQUESTED || status === STATUSES.ABANDONED_BY_DEV
      );
    }
    
    setAvailableStatuses(
      filteredTransitions.map(status => ({
        value: status,
        label: getStatusLabel(status)
      }))
    );
    
    if (filteredTransitions.length > 0) {
      setNextStatus(filteredTransitions[0]);
      setSelectedStatus(filteredTransitions[0]);
    } else {
      setNextStatus(null);
      setSelectedStatus(currentStatus);
    }
  }, [currentStatus, matchStatus]);

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

  // Text for the "quick transition" button; still keep this for user-friendliness
  const getNextStatusButtonText = (status: string, nextStatus: string | null): string => {
    if (!nextStatus) return 'Update Status';
    if (nextStatus === STATUSES.DEV_REQUESTED) return 'Request Assignment';
    if (nextStatus === STATUSES.IN_PROGRESS) return 'Start Working';
    if (nextStatus === STATUSES.READY_FOR_QA) return 'Submit for QA';
    return 'Update Status';
  };

  // If still checking permissions, show loading
  if (isPermissionChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        <p>Checking permissions...</p>
      </div>
    );
  }
  
  // Hide if the developer doesn't have a match
  if (matchStatus === null && currentStatus !== 'pending_match') {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <UserCheck className="h-4 w-4" />
        <AlertTitle>Request Assignment</AlertTitle>
        <AlertDescription>
          You need to request assignment to this ticket before you can update its status.
        </AlertDescription>
      </Alert>
    );
  }

  // Hide if no valid actions
  if (!availableStatuses.length) {
    return (
      <Alert>
        <AlertTitle>No Available Status Updates</AlertTitle>
        <AlertDescription>
          {currentStatus === 'ready_for_qa' 
            ? "You've submitted this work for QA. Waiting for client review." 
            : "No status transitions available at this time."}
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
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              getStatusIcon(nextStatus)
            )}
            <span className="ml-2">{getNextStatusButtonText(currentStatus, nextStatus)}</span>
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
              disabled={isUpdating || !availableStatuses.length}
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
            disabled={isUpdating || selectedStatus === currentStatus || !availableStatuses.length}
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
        
        {matchStatus && matchStatus !== 'approved' && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded text-amber-800 text-xs">
            Your match status is <span className="font-medium capitalize">{matchStatus}</span>. 
            {matchStatus === 'pending' ? ' Waiting for client approval.' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperStatusUpdate;
