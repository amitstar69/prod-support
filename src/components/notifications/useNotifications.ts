
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Notification } from './types';
import { fetchUserNotifications, setupNotificationsSubscription } from '../../integrations/supabase/notifications';

export const useNotifications = (userId: string | null, handleNotificationClick: (notification: Notification) => void) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      console.log('Fetching notifications for user:', userId);
      const result = await fetchUserNotifications(userId);
      
      if (result.success) {
        console.log('Loaded notifications:', result.data.length);
        const componentNotifications: Notification[] = result.data.map(notification => ({
          ...notification,
          notification_type: notification.notification_type || 'general',
        }));
        setNotifications(componentNotifications);
      } else {
        console.error('Error loading notifications:', result.error);
      }
    } catch (error) {
      console.error('Exception loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadNotifications();
      
      const cleanup = setupNotificationsSubscription(userId, (newNotification) => {
        const componentNotification: Notification = {
          ...newNotification,
          notification_type: newNotification.notification_type || 'general',
        };
        setNotifications(prev => [componentNotification, ...prev]);
        
        toast.info(componentNotification.title, {
          description: componentNotification.message,
          action: {
            label: 'View',
            onClick: () => handleNotificationClick(componentNotification)
          }
        });
      });
      
      return cleanup;
    }
  }, [userId, handleNotificationClick]);

  return { notifications, isLoading, setNotifications };
};
