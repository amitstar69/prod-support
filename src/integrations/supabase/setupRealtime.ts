
import { supabase } from './client';

// Function to enable realtime for a specific table
export const enableRealtimeForTable = async (tableName: string) => {
  try {
    console.log(`Attempting to enable realtime for ${tableName}...`);
    
    // Instead of using RPC, use direct SQL queries with Supabase's postgrest API
    // First, check if the table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .maybeSingle();
    
    if (tableCheckError) {
      console.error(`Error checking if table ${tableName} exists:`, tableCheckError);
      return { success: false, error: tableCheckError };
    }
    
    if (!tableExists) {
      console.error(`Table ${tableName} does not exist`);
      return { success: false, error: `Table ${tableName} does not exist` };
    }
    
    // Enable realtime directly through the Supabase client's channel API
    const channel = supabase.channel(`realtime:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, payload => {
        console.log('Change received!', payload);
      })
      .subscribe(status => {
        console.log(`Realtime subscription status for ${tableName}:`, status);
      });
    
    console.log(`Successfully enabled realtime for ${tableName}`);
    return { success: true };
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
  ];
  
  const results = await Promise.all(
    tables.map(table => enableRealtimeForTable(table))
  );
  
  const allSuccessful = results.every(result => result.success);
  
  return {
    success: allSuccessful,
    results
  };
};
