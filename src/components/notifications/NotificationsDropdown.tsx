
import React, { useState } from 'react';
import { BellIcon, BellRingIcon, CheckIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { NotificationContent } from './NotificationContent';
import { useAuth } from '../../contexts/auth';
import { useNotifications } from '../../hooks/notifications/useNotifications';

const NotificationsDropdown: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    handleMarkAllAsRead, 
    loadNotifications 
  } = useNotifications();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <>
              <BellRingIcon className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </>
          ) : (
            <BellIcon className="h-5 w-5" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
            >
              <CheckIcon className="h-3.5 w-3.5 mr-1" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`px-4 py-3 cursor-pointer ${
                    notification.is_read ? 'opacity-70' : 'bg-primary/5'
                  }`}
                >
                  <NotificationContent
                    notification={notification}
                    onActionComplete={loadNotifications}
                  />
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
