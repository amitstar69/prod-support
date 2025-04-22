
import { useState } from 'react';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/auth';

export const useStatusUpdate = (
  ticketId: string,
  currentStatus: string,
  onStatusUpdated?: () => void
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userType } = useAuth();

  const handleUpdateStatus = async (newStatusId: string) => {
    if (newStatusId === currentStatus) {
      toast.info(`Status is already set to ${newStatusId}`);
      return;
    }
    
    setIsUpdating(true);
    setError(null);

    try {
      console.log(`Updating status from ${currentStatus} to ${newStatusId}`);
      const response = await updateHelpRequest(
        ticketId,
        { status: newStatusId },
        userType || 'developer'
      );
      
      if (response.success) {
        toast.success(`Ticket status updated successfully`);
        onStatusUpdated?.();
      } else {
        setError(response.error || 'Failed to update status');
        toast.error(response.error || 'Permission denied');
        console.error('Status update failed:', response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('An error occurred while updating the status');
      console.error('Exception in status update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    error,
    setError,
    handleUpdateStatus
  };
};
