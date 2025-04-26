
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExtendedNotification } from '../../types/notifications';
import NotificationActions from './NotificationActions';

interface NotificationContentProps {
  notification: ExtendedNotification;
  onActionComplete: () => void;
}

export const NotificationContent: React.FC<NotificationContentProps> = ({ 
  notification,
  onActionComplete
}) => {
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-start">
          <span className="font-medium text-sm">{notification.title}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(notification.created_at)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{notification.message}</p>
      </div>
      <NotificationActions 
        notification={notification} 
        onActionComplete={onActionComplete} 
      />
    </>
  );
};
