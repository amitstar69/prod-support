
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
import { 
  Loader2, 
  CheckCircle2, 
  ArrowRightCircle, 
  ClipboardCheck, 
  UserCheck, 
  AlertTriangle, 
  ShieldAlert, 
  FileQuestion,
  MessageCircle,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { 
  getAllowedStatusTransitions, 
  getStatusLabel, 
  getStatusDescription, 
  STATUSES
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
        const { data: matchData, error } = await supabase
          .from('help_request_matches')
          .select('status')
          .eq('request_id', ticketId)
          .eq('developer_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error checking match status:', error);
          setMatchStatus(null);
        } else if (matchData) {
          console.log('Match data found:', matchData);
          setMatchStatus(matchData.status);
        } else {
          console.log('No match data found');
          setMatchStatus(null);
        }
      } catch (error) {
        console.error('Exception checking developer permission:', error);
        setMatchStatus(null);
      } finally {
        setIsPermissionChecking(false);
      }
    };
    checkDeveloperPermission();
  }, [ticketId, userId]);

  useEffect(() => {
    // This centralizes ALL transition logic
    // Only STATUS_TRANSITIONS + helpers used here
    const transitions = getAllowedStatusTransitions(currentStatus, 'developer');
    
    console.log('Available transitions for developer:', transitions);
    console.log('Current status:', currentStatus);
    console.log('Match status:', matchStatus);
    
    // Filter transitions based on match status
    let filteredTransitions = [...transitions];
    
    // Only developers with approved match can update the status
    if (matchStatus !== 'approved') {
      filteredTransitions = transitions.filter(
        s => s === STATUSES.DEV_REQUESTED
      );
    }
    
    setAvailableStatuses(
      filteredTransitions.map(s => ({
        value: s,
        label: getStatusLabel(s)
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
      toast.info(`Status is already set to ${getStatusLabel(selectedStatus)}`);
      return;
    }
    setIsUpdating(true);
    setError(null);

    try {
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
        toast.error(response.error || 'Permission denied: ' + (response.error || 'Cannot update status'));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
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
        userType || 'developer'
      );
      if (response.success) {
        toast.success(`Ticket status updated to ${getStatusLabel(nextStatus)}`);
        onStatusUpdated();
      } else {
        setError(response.error || 'Failed to update status');
        toast.error(response.error || 'Permission denied: cannot update status');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('An error occurred while updating the status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Show info if still permission checking
  if (isPermissionChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        <p>Checking permissions...</p>
      </div>
    );
  }

  // Waiting for client approval or other blocked state
  if ((matchStatus === 'pending' || matchStatus === 'rejected') && currentStatus !== 'pending_match') {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>{matchStatus === 'pending' ? 'Waiting for Client Approval' : 'Application Rejected'}</AlertTitle>
        <AlertDescription>
          {matchStatus === 'pending'
            ? "Your application is pending client approval. You can't update the ticket until approved."
            : "You can't update this ticket because your application was rejected."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!availableStatuses.length) {
    return (
      <Alert>
        <AlertTitle>No Available Status Updates</AlertTitle>
        <AlertDescription>
          {currentStatus === 'ready_for_client_qa'
            ? "You've submitted for QA. Waiting for client review."
            : currentStatus === 'qa_fail'
            ? "Client has requested changes. Please update the implementation."
            : currentStatus === 'resolved'
            ? "This ticket has been successfully resolved."
            : "No status transitions available at this time."}
        </AlertDescription>
      </Alert>
    );
  }

  // Simple icon logic based on status value
  const getStatusIcon = (status: string) => {
    if (status === STATUSES.IN_PROGRESS) return <ArrowRightCircle className="h-4 w-4" />;
    if (status === STATUSES.READY_FOR_CLIENT_QA) return <ClipboardCheck className="h-4 w-4" />;
    if (status === STATUSES.DEV_REQUESTED) return <UserCheck className="h-4 w-4" />;
    if (status === STATUSES.RESOLVED) return <CheckCircle2 className="h-4 w-4" />;
    if (status === STATUSES.REQUIREMENTS_REVIEW) return <FileQuestion className="h-4 w-4" />;
    if (status === STATUSES.NEED_MORE_INFO) return <MessageCircle className="h-4 w-4" />;
    if (status === STATUSES.READY_FOR_FINAL_ACTION) return <FileCheck className="h-4 w-4" />;
    return null;
  };

  // More maintainable labels
  const getNextStatusButtonText = (next: string | null): string => {
    if (!next) return 'Update Status';
    if (next === STATUSES.DEV_REQUESTED) return 'Request Assignment';
    if (next === STATUSES.IN_PROGRESS) return 'Start Working';
    if (next === STATUSES.READY_FOR_CLIENT_QA) return 'Submit for QA';
    if (next === STATUSES.REQUIREMENTS_REVIEW) return 'Start Review';
    if (next === STATUSES.NEED_MORE_INFO) return 'Need More Info';
    if (next === STATUSES.RESOLVED) return 'Mark as Resolved';
    if (next === STATUSES.READY_FOR_FINAL_ACTION) return 'Final Actions';
    return getStatusLabel(next);
  };

  // Button variants based on action type
  const getButtonVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === STATUSES.NEED_MORE_INFO) return "secondary";
    if (status === STATUSES.RESOLVED) return "default";
    return "default";
  };

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
            variant={getButtonVariant(nextStatus)}
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
            {currentStatus === 'ready_for_client_qa'
              ? "You've submitted for QA. Waiting for client review."
              : "No status transitions available at this time."}
          </AlertDescription>
        </Alert>
      )}

      {availableStatuses.length > 1 && (
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
            Your application status: <span className="font-medium capitalize">{matchStatus}</span>.
            {matchStatus === 'pending' ? ' Waiting for client approval.' : ' Not eligible for status changes.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperStatusUpdate;
