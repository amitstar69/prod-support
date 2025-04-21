
import React, { useState, useEffect } from 'react';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { 
  getAllowedStatusTransitions, 
  getStatusLabel, 
  getStatusDescription, 
  STATUSES
} from '../../utils/helpRequestStatusUtils';
import StatusDropdown from '../developer-actions/StatusDropdown';

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
  const [error, setError] = useState<string | null>(null);
  const { userType, userId } = useAuth();
  const [matchStatus, setMatchStatus] = useState<string | null>(null);
  const [isPermissionChecking, setIsPermissionChecking] = useState<boolean>(true);
  const [availableTransitions, setAvailableTransitions] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);

  // Normalize the current status for consistency
  const normalizedCurrentStatus = currentStatus?.replace(/-/g, '_') || '';

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
    // Get all available transitions for the current status
    const transitions = getAllowedStatusTransitions(normalizedCurrentStatus || currentStatus, 'developer');
    
    console.log('Available transitions for developer:', transitions);
    console.log('Current status:', currentStatus);
    console.log('Normalized status:', normalizedCurrentStatus);
    console.log('Match status:', matchStatus);
    
    // Filter transitions based on match status
    let filteredTransitions = [...transitions];
    
    // Only developers with approved match can update the status
    if (matchStatus !== 'approved') {
      filteredTransitions = transitions.filter(
        s => s === STATUSES.DEV_REQUESTED
      );
    }
    
    setAvailableTransitions(filteredTransitions);
    
    if (filteredTransitions.length > 0) {
      setSelectedStatus(filteredTransitions[0]);
    } else {
      setSelectedStatus(normalizedCurrentStatus || currentStatus);
    }
  }, [currentStatus, matchStatus, normalizedCurrentStatus]);

  const handleUpdateStatus = async (newStatusId: string) => {
    if (newStatusId === currentStatus || newStatusId === normalizedCurrentStatus) {
      toast.info(`Status is already set to ${getStatusLabel(newStatusId)}`);
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    setSelectedStatus(newStatusId);

    try {
      console.log(`Updating status from ${currentStatus} to ${newStatusId}`);
      const response = await updateHelpRequest(
        ticketId,
        { status: newStatusId },
        userType || 'developer'
      );
      
      if (response.success) {
        toast.success(`Ticket status updated to ${getStatusLabel(newStatusId)}`);
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
  if ((matchStatus === 'pending' || matchStatus === 'rejected') && normalizedCurrentStatus !== 'pending_match') {
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

  if (!availableTransitions.length) {
    return (
      <Alert>
        <AlertTitle>No Available Status Updates</AlertTitle>
        <AlertDescription>
          {normalizedCurrentStatus === 'ready_for_client_qa'
            ? "You've submitted for QA. Waiting for client review."
            : normalizedCurrentStatus === 'qa_fail'
            ? "Client has requested changes. Please update the implementation."
            : normalizedCurrentStatus === 'resolved'
            ? "This ticket has been successfully resolved."
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

      <div className="space-y-4">
        <StatusDropdown
          defaultStatusId={selectedStatus}
          onStatusChange={handleUpdateStatus}
          placeholder="Select new status"
          required={true}
          userType="developer"
          disabled={isUpdating}
        />

        {isUpdating && (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Updating status...</span>
          </div>
        )}
      </div>

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
