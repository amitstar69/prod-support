
import React from 'react';
import { toast } from 'sonner';
import StatusDropdown from '../developer-actions/StatusDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../integrations/supabase/client';

interface ClientActionStatusProps {
  ticketId: string;
  currentStatus?: string;
  onStatusUpdate?: () => void;
}

const ClientActionStatus: React.FC<ClientActionStatusProps> = ({
  ticketId,
  currentStatus,
  onStatusUpdate
}) => {
  console.log("ClientActionStatus render with:", { ticketId, currentStatus });

  const handleStatusChange = async (newStatusId: string) => {
    try {
      console.log(`Client updating ticket ${ticketId} status from ${currentStatus} to ${newStatusId}`);
      
      if (newStatusId === currentStatus) {
        console.log("No status change detected");
        return;
      }
      
      const { error } = await supabase
        .from('help_requests')
        .update({ status: newStatusId })
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('Status updated successfully');
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Update Request Status</CardTitle>
      </CardHeader>
      <CardContent>
        <StatusDropdown
          defaultStatusId={currentStatus}
          onStatusChange={handleStatusChange}
          placeholder="Select new status"
          required={true}
          userType="client"
        />
      </CardContent>
    </Card>
  );
};

export default ClientActionStatus;
