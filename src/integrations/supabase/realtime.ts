
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

// Additional realtime handlers can be defined here
