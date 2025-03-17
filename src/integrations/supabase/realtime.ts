
import { supabase } from './client';
import { toast } from 'sonner';

// Setup realtime subscription for help requests
export const setupHelpRequestsSubscription = (callback: (payload: any) => void) => {
  console.log('Setting up help requests subscription');
  
  try {
    const channel = supabase
      .channel('help_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests'
        },
        (payload) => {
          console.log('Help request change received:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('Help requests subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to help requests');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to help requests');
          toast.error('Could not connect to real-time updates. Please refresh.');
        }
      });
      
    // Return the subscription for cleanup
    return () => {
      console.log('Cleaning up help requests subscription');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Exception setting up help requests subscription:', error);
    toast.error('Real-time connection failed. Some features may not work.');
    return () => {}; // Return empty cleanup function
  }
};

// Setup realtime subscription for help request applications
export const setupApplicationsSubscription = (requestId: string, callback: (payload: any) => void) => {
  console.log('Setting up applications subscription for request:', requestId);
  
  try {
    const channel = supabase
      .channel(`applications_changes_${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_request_matches',
          filter: `request_id=eq.${requestId}`
        },
        (payload) => {
          console.log('Application change received:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('Applications subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to applications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to applications');
          toast.error('Could not connect to application updates. Please refresh.');
        }
      });
      
    // Return the subscription for cleanup
    return () => {
      console.log('Cleaning up applications subscription');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Exception setting up applications subscription:', error);
    toast.error('Real-time connection failed. Some features may not work.');
    return () => {}; // Return empty cleanup function
  }
};

// Setup realtime subscription for notifications
export const setupNotificationsSubscription = (userId: string, callback: (payload: any) => void) => {
  console.log('Setting up notifications subscription for user:', userId);
  
  try {
    const channel = supabase
      .channel(`notifications_for_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Notification received:', payload);
          callback(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Notifications subscription status:', status);
      });
      
    // Return the subscription for cleanup
    return () => {
      console.log('Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Exception setting up notifications subscription:', error);
    return () => {}; // Return empty cleanup function
  }
};
