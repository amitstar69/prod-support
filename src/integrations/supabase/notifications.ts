
import { supabase } from './client';
import { toast } from 'sonner';
import { Notification } from '../../components/notifications/types';
import { enableRealtimeForTable } from './setupRealtime';

export const fetchUserNotifications = async (userId: string | null) => {
  try {
    if (!userId) {
      console.log('No user ID provided for fetching notifications');
      return { success: false, error: 'User ID is required', data: [] };
    }

    console.log('Fetching notifications for user:', userId);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log('Fetched notifications:', data ? data.length : 0);
    return { success: true, data: data as Notification[] };
  } catch (error) {
    console.error('Exception fetching notifications:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      data: [] 
    };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    console.log('Marking notification as read:', notificationId);
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select();

    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }

    console.log('Notification marked as read:', notificationId);
    return { success: true, data };
  } catch (error) {
    console.error('Exception marking notification as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    console.log('Marking all notifications as read for user:', userId);
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }

    console.log('All notifications marked as read for user:', userId, 'Count:', data.length);
    return { success: true, data };
  } catch (error) {
    console.error('Exception marking all notifications as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Setup realtime subscription for notifications
export const setupNotificationsSubscription = (userId: string, callback: (notification: Notification) => void) => {
  console.log('Setting up notifications subscription for user:', userId);
  
  if (!userId) {
    console.error('User ID is required for notifications subscription');
    return () => {};
  }
  
  try {
    // First, ensure realtime is enabled for the notifications table
    enableRealtimeForTable('notifications');
    
    const channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received via subscription:', payload);
          callback(payload.new as Notification);
        }
      )
      .subscribe((status) => {
        console.log('Notifications subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to notifications');
          toast.error('Could not connect to notification updates. Please refresh.');
        }
      });
      
    // Return the cleanup function
    return () => {
      console.log('Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Exception setting up notifications subscription:', error);
    toast.error('Notification connection failed. Some features may not work.');
    return () => {}; // Return empty cleanup function
  }
};

// Create a notification manually (backup method if trigger doesn't work)
export const createNotification = async (notification: {
  user_id: string;
  related_entity_id: string;
  entity_type: string;
  title: string;
  message: string;
  notification_type?: string;
  action_data?: any;
}) => {
  try {
    console.log('Creating notification:', notification);
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select();

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }

    console.log('Notification created successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Exception creating notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
