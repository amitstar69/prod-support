
import React from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { updateApplicationStatus } from '../../integrations/supabase/helpRequestsApplications';
import { useAuth } from '../../contexts/auth';

interface NotificationActionsProps {
  notification: {
    id: string;
    notification_type: string;
    action_data: {
      application_id: string;
      developer_name: string;
      request_title: string;
    };
  };
  onActionComplete: () => void;
}

const NotificationActions: React.FC<NotificationActionsProps> = ({ 
  notification, 
  onActionComplete 
}) => {
  const { userId } = useAuth();

  const handleAccept = async () => {
    if (!userId || !notification.action_data?.application_id) return;
    
    try {
      toast.loading('Accepting application...');
      const result = await updateApplicationStatus(
        notification.action_data.application_id,
        'approved',
        userId
      );
      
      if (result.success) {
        toast.success('Application accepted successfully');
        onActionComplete();
      } else {
        toast.error('Failed to accept application');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('An error occurred while accepting the application');
    }
  };

  const handleReject = async () => {
    if (!userId || !notification.action_data?.application_id) return;
    
    try {
      toast.loading('Rejecting application...');
      const result = await updateApplicationStatus(
        notification.action_data.application_id,
        'rejected',
        userId
      );
      
      if (result.success) {
        toast.success('Application rejected');
        onActionComplete();
      } else {
        toast.error('Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('An error occurred while rejecting the application');
    }
  };

  if (notification.notification_type === 'new_application') {
    return (
      <div className="flex gap-2 mt-2">
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={handleReject}
          className="flex-1"
        >
          Reject
        </Button>
        <Button 
          size="sm"
          onClick={handleAccept}
          className="flex-1"
        >
          Accept
        </Button>
      </div>
    );
  }

  return null;
};

export default NotificationActions;
