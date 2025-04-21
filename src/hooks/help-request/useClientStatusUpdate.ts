
import { useState, useEffect } from 'react';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/auth';

export const useClientStatusUpdate = (
  requestId: string,
  currentStatus: string,
  onStatusUpdated?: () => void,
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const { userType } = useAuth();

  const handleQuickUpdate = async (nextStatus: string) => {
    if (!nextStatus) {
      toast.error('No valid next status available');
      return;
    }
    setSelectedStatus(nextStatus);
    await handleUpdateStatus(nextStatus);
  };

  const handleUpdateStatus = async (newStatusId: string) => {
    if (newStatusId === currentStatus) {
      toast.info(`Status is already set to ${newStatusId}`);
      return;
    }
    
    setIsUpdating(true);
    setError(null);

    try {
      const response = await updateHelpRequest(
        requestId,
        { status: newStatusId },
        userType || 'client'
      );
      
      if (response.success) {
        toast.success(`Ticket status updated successfully`);
        onStatusUpdated?.();
      } else {
        setError(response.error || 'Failed to update status');
        toast.error(response.error || 'Permission denied');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('An error occurred while updating the status');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    error,
    setError,
    selectedStatus,
    setSelectedStatus,
    handleQuickUpdate,
    handleUpdateStatus
  };
};
