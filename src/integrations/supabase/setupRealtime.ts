
import { supabase } from './client';

// Function to enable realtime for a specific table
export const enableRealtimeForTable = async (tableName: string) => {
  try {
    // First, set the table's replica identity to FULL to ensure we get complete row data
    const { error: replicaError } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE ${tableName} REPLICA IDENTITY FULL;`
    });
    
    if (replicaError) {
      console.error(`Error setting replica identity for ${tableName}:`, replicaError);
      return { success: false, error: replicaError };
    }
    
    // Then, add the table to the supabase_realtime publication
    const { error: publicationError } = await supabase.rpc('execute_sql', {
      sql: `
        BEGIN;
        -- Check if publication exists
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
            CREATE PUBLICATION supabase_realtime;
          END IF;
        END
        $$;
        
        -- Add table to publication if not already added
        ALTER PUBLICATION supabase_realtime ADD TABLE ${tableName};
        COMMIT;
      `
    });
    
    if (publicationError) {
      console.error(`Error adding ${tableName} to realtime publication:`, publicationError);
      return { success: false, error: publicationError };
    }
    
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
