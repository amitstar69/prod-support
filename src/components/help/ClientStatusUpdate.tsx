
import React, { useState } from 'react';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';

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
  const [error, setError] = useState<string | null>(null);
  const { userType } = useAuth();

  // Clients can only approve requests that are in client-review status
  // or mark completed requests as needing more work
  const canApprove = currentStatus === 'client-review';
  const canRejectOrReopen = ['client-review', 'completed'].includes(currentStatus);

  const handleApproveRequest = async () => {
    if (!canApprove) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const response = await updateHelpRequest(
        ticketId,
        { status: 'client-approved' },
        userType || 'client'
      );

      if (response.success) {
        toast.success('The request has been approved');
        onStatusUpdated();
      } else {
        setError(response.error || 'Failed to approve request');
        toast.error(response.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('An error occurred while approving the request');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!canRejectOrReopen) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const response = await updateHelpRequest(
        ticketId,
        { status: 'in-progress' },
        userType || 'client'
      );

      if (response.success) {
        toast.success('The request has been sent back for more work');
        onStatusUpdated();
      } else {
        setError(response.error || 'Failed to send request back');
        toast.error(response.error || 'Failed to send request back');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('An error occurred while sending the request back');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!canApprove && !canRejectOrReopen) {
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

      <div className="bg-secondary/30 p-4 rounded-md">
        <h3 className="font-medium text-sm mb-2">Client Actions</h3>
        <Separator className="mb-4" />
        
        <div className="flex flex-col sm:flex-row gap-2">
          {canApprove && (
            <Button
              onClick={handleApproveRequest}
              disabled={isUpdating}
              className="w-full"
              variant="default"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              <span>Approve Work</span>
            </Button>
          )}
          
          {canRejectOrReopen && (
            <Button
              onClick={handleRejectRequest}
              disabled={isUpdating}
              className="w-full"
              variant="secondary"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              <span>{currentStatus === 'completed' ? 'Reopen Request' : 'Request Changes'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientStatusUpdate;
