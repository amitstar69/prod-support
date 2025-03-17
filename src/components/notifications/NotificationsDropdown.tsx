import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';
import { 
  Notification, 
  fetchUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  setupNotificationsSubscription 
} from '../../integrations/supabase/notifications';
import { BellIcon, BellRingIcon, CheckIcon, XIcon } from 'lucide-react';
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
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const NotificationsDropdown: React.FC = () => {
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadNotifications();
      
      // Setup realtime subscription
      const cleanup = setupNotificationsSubscription(userId, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show toast for new notification
        toast.info(newNotification.title, {
          description: newNotification.message,
          action: {
            label: 'View',
            onClick: () => handleNotificationClick(newNotification)
          }
        });
      });
      
      return cleanup;
    }
  }, [userId, isAuthenticated]);

  const loadNotifications = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      const result = await fetchUserNotifications(userId);
      
      if (result.success) {
        setNotifications(result.data);
      } else {
        console.error('Error loading notifications:', result.error);
      }
    } catch (error) {
      console.error('Exception loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read
    await markNotificationAsRead(notification.id);
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
    );
    
    setIsOpen(false);
    
    // Navigate based on notification type
    switch (notification.entity_type) {
      case 'application':
        // Get the request ID directly from the related_entity_id if it's a request ID
        // or fetch it from the application if it's an application ID
        if (notification.related_entity_id.includes('-')) {
          try {
            // If it's an application ID, get the request ID from the application
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
              // Give the dashboard a chance to load before viewing the request
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
          // If the related_entity_id is the request ID itself
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
        // For messages, go to profile messages tab
        navigate(`/profile`);
        setTimeout(() => {
          // Use CustomEvent to switch to the messages tab
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

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  };

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
                    className={`px-4 py-3 cursor-pointer ${notification.is_read ? 'opacity-70' : 'bg-primary/5'}`}
                    onClick={() => handleNotificationClick(notification)}
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
                  </DropdownMenuItem>
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
