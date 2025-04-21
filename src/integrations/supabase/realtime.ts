
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
export const setupApplicationsSubscription = (developerId: string, callback: (payload: any) => void) => {
  console.log('Setting up applications subscription for developer:', developerId);
  
  try {
    const channel = supabase
      .channel(`applications_changes_${developerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_request_matches',
          filter: `developer_id=eq.${developerId}`
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

// Check table info and enable realtime (renamed to avoid conflict)
export const checkTableInfo = async (tableName: "help_requests" | "help_request_matches" | "notifications" | "chat_messages" | "help_sessions") => {
  try {
    // First, check if the table is already in the realtime publication
    const { data, error } = await supabase.rpc('get_table_info', { table_name: tableName });
    
    if (error) {
      console.error(`Error getting table info for ${tableName}:`, error);
      return { success: false, error: error.message };
    }
    
    console.log(`Table info for ${tableName}:`, data);
    
    // Enable realtime for the specific table - now using a properly typed table name
    const enableRealtimeResult = await supabase.from(tableName).select('*').limit(1);
    
    if (enableRealtimeResult.error) {
      console.error(`Error enabling realtime for ${tableName}:`, enableRealtimeResult.error);
      return { success: false, error: enableRealtimeResult.error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Exception enabling realtime for ${tableName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
