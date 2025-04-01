
import { supabase } from './client';

/**
 * Utility function to check database constraints for a specific table
 * This helps debug issues with check constraints
 */
export const checkDatabaseConstraints = async (tableName: string) => {
  try {
    // First, query the database for the table information
    const { data, error } = await supabase
      .rpc('get_table_info', { table_name: tableName });
      
    if (error) {
      console.error(`Error checking database constraints for ${tableName}:`, error);
      return { success: false, error: error.message };
    }
    
    console.log(`Database constraints for table ${tableName}:`, data);
    
    // Find check constraints specifically
    let checkConstraints: any[] = [];
    
    if (data && typeof data === 'object' && 'constraints' in data && Array.isArray(data.constraints)) {
      checkConstraints = data.constraints.filter((constraint: any) => 
        constraint && 
        typeof constraint === 'object' && 
        'constraint_type' in constraint &&
        constraint.constraint_type === 'CHECK'
      );
    }
    
    console.log(`Check constraints for table ${tableName}:`, checkConstraints);
    
    return { 
      success: true, 
      data: {
        tableInfo: data,
        checkConstraints
      }
    };
  } catch (error) {
    console.error(`Exception checking database constraints for ${tableName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Execute this function on load to check the help_request_matches table constraints
checkDatabaseConstraints('help_request_matches')
  .then(result => {
    console.log('Constraint check results:', result);
  })
  .catch(error => {
    console.error('Error during constraint check:', error);
  });
