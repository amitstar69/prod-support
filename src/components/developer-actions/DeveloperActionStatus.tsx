
import React from 'react';
import { toast } from 'sonner';
import StatusDropdown from './StatusDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../integrations/supabase/client';

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
  const handleStatusChange = async (newStatusId: string) => {
    try {
      const { error } = await supabase
        .from('help_requests')
        .update({ status: newStatusId })
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('Status updated successfully');
      onStatusUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Update Status</CardTitle>
      </CardHeader>
      <CardContent>
        <StatusDropdown
          defaultStatusId={currentStatus}
          onStatusChange={handleStatusChange}
          placeholder="Select new status"
          required={true}
        />
      </CardContent>
    </Card>
  );
};

export default DeveloperActionStatus;
