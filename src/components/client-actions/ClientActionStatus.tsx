
import React, { useState } from 'react';
import { toast } from 'sonner';
import StatusDropdown from '../developer-actions/StatusDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../integrations/supabase/client';
import { Alert, AlertDescription } from '../ui/alert';
import { getStatusLabel, getAllowedStatusTransitions } from '../../utils/helpRequestStatusUtils';
import { Button } from '../ui/button';

interface ClientActionStatusProps {
  ticketId: string;
  currentStatus?: string;
  onStatusUpdate?: () => void;
}

const ClientActionStatus: React.FC<ClientActionStatusProps> = ({
  ticketId,
  currentStatus = '',
  onStatusUpdate
}) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get allowed transitions for client user
  const allowedTransitions = currentStatus 
    ? getAllowedStatusTransitions(currentStatus, 'client')
    : [];

  const handleStatusChange = async (newStatusId: string) => {
    try {
      if (newStatusId === currentStatus) {
        return;
      }
      
      setIsUpdating(true);
      setError(null);
      
      const { error } = await supabase
        .from('help_requests')
        .update({ status: newStatusId })
        .eq('id', ticketId);

      if (error) {
        setError(error.message || 'Failed to update status');
        toast.error(`Status update failed: ${error.message || 'Unknown error'}`);
        return;
      }

      toast.success(`Status updated successfully to ${getStatusLabel(newStatusId)}`);
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Always show the component now, to match developer view
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Update Status</span>
          {currentStatus && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {getStatusLabel(currentStatus)}
            </span>
          )}
        </div>
        
        <StatusDropdown
          defaultStatusId={selectedStatus}
          onStatusChange={setSelectedStatus}
          placeholder="Select new status"
          required={true}
          userType="client"
        />
        
        <Button
          onClick={() => handleStatusChange(selectedStatus)}
          disabled={selectedStatus === currentStatus || isUpdating || !selectedStatus || allowedTransitions.length === 0}
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Update Status"}
        </Button>
      </div>
    </div>
  );
};

export default ClientActionStatus;
