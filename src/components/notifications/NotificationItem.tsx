
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Notification } from './types';
import NotificationActions from './NotificationActions';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  };

  return (
    <DropdownMenuItem
      key={notification.id}
      className={`px-4 py-3 cursor-pointer ${
        notification.is_read ? 'opacity-70' : 'bg-primary/5'
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-start">
          <span className="font-medium text-sm">{notification.title}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(notification.created_at)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{notification.message}</p>
      </div>
      {notification.notification_type === 'new_application' && notification.action_data && (
        <NotificationActions 
          notification={notification}
          onActionComplete={() => {}} // This will be passed from parent
        />
      )}
    </DropdownMenuItem>
  );
};

export default NotificationItem;
