
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { ExtendedNotification } from '../../types/notifications';
import { 
  fetchUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  setupNotificationsSubscription 
} from '../../integrations/supabase/notifications';
import { toast } from 'sonner';

export const useNotifications = () => {
  const { userId, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      console.log('Fetching notifications for user:', userId);
      const result = await fetchUserNotifications(userId);
      
      if (result.success) {
        console.log('Loaded notifications:', result.data.length);
        setNotifications(result.data as ExtendedNotification[]);
      } else {
        console.error('Error loading notifications:', result.error);
      }
    } catch (error) {
      console.error('Exception loading notifications:', error);
    } finally {
      setIsLoading(false);
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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadNotifications();
      
      // Setup realtime subscription
      const cleanup = setupNotificationsSubscription(userId, (newNotification) => {
        setNotifications(prev => [newNotification as ExtendedNotification, ...prev]);
        
        // Show toast for new notification
        toast.info(newNotification.title, {
          description: newNotification.message,
        });
      });
      
      return cleanup;
    }
  }, [userId, isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    handleMarkAllAsRead,
    handleMarkAsRead,
    loadNotifications
  };
};
