
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Notification } from './types';
import { fetchUserNotifications, setupNotificationsSubscription } from '../../integrations/supabase/notifications';

export const useNotifications = (userId: string | null, handleNotificationClick: (notification: Notification) => void) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      console.log('No userId provided, skipping notification fetch');
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      console.log('Fetching notifications for user:', userId);
      const result = await fetchUserNotifications(userId);
      
      if (result.success) {
        console.log('Successfully loaded notifications:', result.data.length);
        const componentNotifications: Notification[] = result.data.map(notification => ({
          ...notification,
          notification_type: notification.notification_type || 'general',
        }));
        setNotifications(componentNotifications);
      } else {
        console.error('Error loading notifications:', result.error);
        setHasError(true);
        toast.error('Failed to load notifications');
      }
    } catch (error) {
      console.error('Exception loading notifications:', error);
      setHasError(true);
      toast.error('An error occurred while loading notifications');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      // Load notifications immediately when component mounts
      loadNotifications();
      
      // Set up subscription for real-time notifications
      const cleanup = setupNotificationsSubscription(userId, (newNotification) => {
        console.log('New notification received:', newNotification);
        const componentNotification: Notification = {
          ...newNotification,
          notification_type: newNotification.notification_type || 'general',
        };
        
        setNotifications(prev => {
          // Check if notification already exists to avoid duplicates
          const exists = prev.some(n => n.id === componentNotification.id);
          if (exists) return prev;
          return [componentNotification, ...prev];
        });
        
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
  }, [userId, handleNotificationClick, loadNotifications]);

  return { 
    notifications, 
    isLoading,
    hasError,
    setNotifications,
    refresh: loadNotifications // Export refresh function to allow manual refresh
  };
};
