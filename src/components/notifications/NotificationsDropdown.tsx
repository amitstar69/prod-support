import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, BellRingIcon, CheckIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { Button } from '../ui/button';
import { markAllNotificationsAsRead } from '../../integrations/supabase/notifications';
import { markNotificationAsRead } from '../../integrations/supabase/notifications';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { useNotifications } from './useNotifications';
import NotificationItem from './NotificationItem';
import { Notification } from './types';

const NotificationsDropdown: React.FC = () => {
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNotificationClick = async (notification: Notification) => {
    console.log('Handling notification click:', notification);
    await markNotificationAsRead(notification.id);
    
    if (notification.notification_type === 'new_application') {
      if (notification.action_data && notification.action_data.application_id) {
        navigate(`/client/applications/${notification.action_data.application_id}`);
        setIsOpen(false);
        return;
      }
    }
    
    setIsOpen(false);
    
    switch (notification.entity_type) {
      case 'application':
        if (notification.related_entity_id && !notification.related_entity_id.includes('-')) {
          navigate(`/client/applications/${notification.related_entity_id}`);
        } else if (notification.related_entity_id && notification.related_entity_id.includes('-')) {
          try {
            const { data, error } = await supabase
              .from('help_request_matches')
              .select('request_id')
              .eq('id', notification.related_entity_id)
              .single();
              
            if (error) {
              console.error('Error fetching application details:', error);
              toast.error('Failed to load application details');
              return;
            }
            
            if (data && data.request_id) {
              navigate(`/client-dashboard`);
              setTimeout(() => {
                const viewRequestEvent = new CustomEvent('viewRequest', { 
                  detail: { requestId: data.request_id } 
                });
                window.dispatchEvent(viewRequestEvent);
              }, 100);
            }
          } catch (err) {
            console.error('Error handling notification click:', err);
            toast.error('Failed to process notification');
          }
        } else {
          navigate(`/client-dashboard`);
          setTimeout(() => {
            const viewRequestEvent = new CustomEvent('viewRequest', { 
              detail: { requestId: notification.related_entity_id } 
            });
            window.dispatchEvent(viewRequestEvent);
          }, 100);
        }
        break;
      case 'application_status':
        navigate(`/developer-dashboard?tab=myApplications`);
        break;
      case 'message':
        navigate(`/profile`);
        setTimeout(() => {
          const switchToMessagesEvent = new CustomEvent('switchToMessages', { 
            detail: { helpRequestId: notification.related_entity_id } 
          });
          window.dispatchEvent(switchToMessagesEvent);
        }, 100);
        break;
      default:
        navigate('/client-dashboard');
    }
  };

  const { notifications, isLoading, hasError, setNotifications, refresh } = useNotifications(userId, handleNotificationClick);

  const handleRefresh = () => {
    console.log('Manually refreshing notifications');
    refresh();
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const result = await markAllNotificationsAsRead(userId);
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        );
        toast.success('All notifications marked as read');
      } else {
        toast.error('Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Exception marking all as read:', error);
      toast.error('An error occurred');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div ref={dropdownRef}>
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
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-8 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="py-6 text-center text-muted-foreground flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
              </div>
            ) : hasError ? (
              <div className="py-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p>Failed to load notifications</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefresh}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationsDropdown;
