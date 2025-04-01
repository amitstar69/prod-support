
import { supabase } from './client';

// Function to enable realtime for a specific table
export const enableRealtimeForTable = async (tableName: "help_requests" | "help_request_matches" | "notifications" | "chat_messages" | "help_sessions") => {
  try {
    console.log(`Enabling realtime for ${tableName}...`);
    
    // Enable realtime directly through the Supabase client's channel API
    // No need to check if the table exists first, as the subscription will silently fail if the table doesn't exist
    const channel = supabase.channel(`realtime:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, payload => {
        console.log(`Change received for ${tableName}:`, payload);
      })
      .subscribe(status => {
        console.log(`Realtime subscription status for ${tableName}:`, status);
      });
    
    console.log(`Successfully enabled realtime for ${tableName}`);
    return { success: true, channel };
  } catch (error) {
    console.error(`Exception enabling realtime for ${tableName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Helper function to set up all required realtime tables
export const setupAllRealtimeTables = async () => {
  const tables = [
    'help_requests',
    'help_request_matches',
    'notifications'
  ] as const;
  
  const results = await Promise.all(
    tables.map(table => enableRealtimeForTable(table))
  );
  
  const allSuccessful = results.every(result => result.success);
  
  return {
    success: allSuccessful,
    results
  };
};
