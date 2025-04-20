
import React, { useState } from 'react';
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
import { Loader2, CheckCircle2, ArrowRightCircle, ArrowUpLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

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

  // Define valid status transitions for clients
  const getNextStatus = (current: string): string => {
    switch (current) {
      case 'client-review':
        return 'client-approved';
      case 'client-approved':
        return 'completed';
      default:
        return current;
    }
  };

  const getAvailableStatuses = (current: string): { value: string; label: string; }[] => {
    const statuses = [];

    if (current === 'client-review') {
      statuses.push({ value: 'client-approved', label: 'Approve Work' });
      statuses.push({ value: 'in-progress', label: 'Request Changes' });
    }

    if (current === 'client-approved' || current === 'completed') {
      statuses.push({ value: 'in-progress', label: 'Reopen Request' });
    }

    return statuses;
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      toast.info(`Status is already set to ${selectedStatus}`);
      return;
    }

    setIsUpdating(true);
    setError(null);
    
    try {
      console.log(`Client updating ticket ${ticketId} status to ${selectedStatus}`);
      
      const response = await updateHelpRequest(
        ticketId,
        { status: selectedStatus },
        userType || 'client'
      );

      if (response.success) {
        toast.success(`Ticket status updated to ${selectedStatus}`);
        onStatusUpdated();
      } else {
        setError(response.error || 'Failed to update status');
        toast.error(response.error || 'Failed to update status');
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
    const nextStatus = getNextStatus(currentStatus);
    setSelectedStatus(nextStatus);
    setIsUpdating(true);
    setError(null);
    
    try {
      console.log(`Quick updating ticket ${ticketId} status to ${nextStatus}`);
      
      const response = await updateHelpRequest(
        ticketId,
        { status: nextStatus },
        userType || 'client'
      );

      if (response.success) {
        toast.success(`Ticket status updated to ${nextStatus}`);
        onStatusUpdated();
      } else {
        setError(response.error || 'Failed to update status');
        toast.error(response.error || 'Failed to update status');
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
      case 'client-approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'in-progress':
        return <ArrowUpLeft className="h-4 w-4" />; // Updated to use ArrowUpLeft instead of ArrowUturnLeft
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <ArrowRightCircle className="h-4 w-4" />;
    }
  };

  const getNextStatusButtonText = (current: string): string => {
    switch (current) {
      case 'client-review':
        return 'Approve Work';
      case 'client-approved':
        return 'Mark as Complete';
      default:
        return 'Update Status';
    }
  };

  // Only render for relevant statuses
  if (!['client-review', 'client-approved', 'completed'].includes(currentStatus)) {
    return null;
  }

  const availableStatuses = getAvailableStatuses(currentStatus);
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
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleQuickUpdate}
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            getStatusIcon(getNextStatus(currentStatus))
          )}
          <span className="ml-2">{getNextStatusButtonText(currentStatus)}</span>
        </Button>
      </div>

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
    </div>
  );
};

export default ClientStatusUpdate;
