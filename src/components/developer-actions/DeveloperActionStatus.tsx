
import React, { useState } from 'react';
import { toast } from 'sonner';
import StatusDropdown from './StatusDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../integrations/supabase/client';
import { Alert, AlertDescription } from '../ui/alert';
import { getStatusLabel } from '../../utils/helpRequestStatusUtils';

interface DeveloperActionStatusProps {
  ticketId: string;
  currentStatus?: string;
  onStatusUpdate?: () => void;
}

const DeveloperActionStatus: React.FC<DeveloperActionStatusProps> = ({
  ticketId,
  currentStatus,
  onStatusUpdate
}) => {
  console.log("DeveloperActionStatus render with:", { ticketId, currentStatus });
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatusId: string) => {
    try {
      console.log(`Updating ticket ${ticketId} status from ${currentStatus} to ${newStatusId}`);
      
      if (newStatusId === currentStatus) {
        console.log("No status change detected");
        return;
      }
      
      setError(null);
      
      const { data, error } = await supabase
        .from('help_requests')
        .update({ status: newStatusId })
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating status:', error);
        setError(error.message || 'Failed to update status');
        toast.error(`Status update failed: ${error.message || 'Unknown error'}`);
        return;
      }

      toast.success(`Status updated successfully to ${getStatusLabel(newStatusId)}`);
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      setError(error.message || 'Failed to update status');
      toast.error('Failed to update status');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Update Status</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <StatusDropdown
          defaultStatusId={currentStatus}
          onStatusChange={handleStatusChange}
          placeholder="Select new status"
          required={true}
          userType="developer"
        />
        {currentStatus && (
          <p className="mt-2 text-xs text-muted-foreground">
            Current status: {getStatusLabel(currentStatus)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DeveloperActionStatus;
