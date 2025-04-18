
import React, { useState } from 'react';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { HelpRequest } from '../../types/helpRequest';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Loader2, CheckCircle2, ArrowRightCircle, ClipboardCheck, UserCheck } from 'lucide-react';

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
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus || 'in-progress');

  // Get the next logical status based on current status
  const getNextStatus = (current: string): string => {
    switch (current) {
      case 'in-progress':
        return 'developer-qa';
      case 'developer-qa':
        return 'client-review';
      case 'client-review':
        // Client needs to approve, developer can't change from here
        return 'client-review';
      case 'client-approved':
        return 'completed';
      default:
        return 'in-progress';
    }
  };

  // Get status options based on current status
  const getAvailableStatuses = (current: string): { value: string; label: string; }[] => {
    // Base statuses always available to developer
    const statuses = [
      { value: 'in-progress', label: 'In Progress' },
    ];

    // Add next statuses based on workflow
    if (current === 'in-progress' || current === 'client-review') {
      statuses.push({ value: 'developer-qa', label: 'Ready for QA' });
    }

    if (current === 'developer-qa' || current === 'in-progress') {
      statuses.push({ value: 'client-review', label: 'Submit for Client Review' });
    }

    if (current === 'client-approved') {
      statuses.push({ value: 'completed', label: 'Mark as Completed' });
    }

    return statuses;
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      toast.info('Status is already set to ' + selectedStatus);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateHelpRequest(ticketId, {
        status: selectedStatus,
      });

      if (response.success) {
        toast.success(`Ticket status updated to ${selectedStatus}`);
        onStatusUpdated();
      } else {
        toast.error(`Failed to update status: ${response.error}`);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('An error occurred while updating the status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickUpdate = async () => {
    const nextStatus = getNextStatus(currentStatus);
    setSelectedStatus(nextStatus);
    setIsUpdating(true);
    
    try {
      const response = await updateHelpRequest(ticketId, {
        status: nextStatus,
      });

      if (response.success) {
        toast.success(`Ticket status updated to ${nextStatus}`);
        onStatusUpdated();
      } else {
        toast.error(`Failed to update status: ${response.error}`);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('An error occurred while updating the status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <ArrowRightCircle className="h-4 w-4" />;
      case 'developer-qa':
        return <ClipboardCheck className="h-4 w-4" />;
      case 'client-review':
        return <UserCheck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getNextStatusButtonText = (current: string): string => {
    switch (current) {
      case 'in-progress':
        return 'Mark Ready for QA';
      case 'developer-qa':
        return 'Submit for Client Review';
      case 'client-approved':
        return 'Mark as Complete';
      default:
        return 'Update Status';
    }
  };

  // Only show the component if the developer can update the status
  if (!['in-progress', 'developer-qa', 'client-approved'].includes(currentStatus)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleQuickUpdate}
          disabled={isUpdating || currentStatus === 'client-review'}
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
              {getAvailableStatuses(currentStatus).map((status) => (
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

export default DeveloperStatusUpdate;
