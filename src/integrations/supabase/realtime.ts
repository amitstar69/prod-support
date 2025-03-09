
import { supabase } from './client';

// Add real-time subscription to help_requests table
export const setupHelpRequestsSubscription = async () => {
  const { data: authData } = await supabase.auth.getSession();
  
  if (authData.session) {
    const userId = authData.session.user.id;
    
    try {
      const channel = supabase
        .channel('help_requests_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'help_requests',
          filter: `client_id=eq.${userId}`
        }, (payload) => {
          console.log('Real-time update received for help_requests:', payload);
        })
        .subscribe((status) => {
          console.log('Help requests subscription status:', status);
        });
      
      console.log('Real-time subscription to help_requests set up for user:', userId);
      return channel;
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      return null;
    }
  }
  return null;
};

// Update the enableRealtimeForHelpRequests function to use Supabase's built-in channel functionality
export const enableRealtimeForHelpRequests = async () => {
  try {
    console.log('Setting up real-time channel for help_requests table...');
    
    const channel = supabase
      .channel('help_requests_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'help_requests'
      }, (payload) => {
        console.log('Real-time update received:', payload);
      })
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    if (channel) {
      console.log('Real-time enabled for help_requests table successfully');
      return { success: true, channel };
    } else {
      console.error('Failed to create channel');
      return { success: false, error: 'Failed to create channel' };
    }
  } catch (error) {
    console.error('Exception enabling real-time:', error);
    return { success: false, error };
  }
};

// DO NOT call setupHelpRequestsSubscription here to avoid circular dependency
// It should be called after client initialization
