import { supabase } from './client';

// Validation utilities
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isLocalId = (id: string): boolean => {
  return id.startsWith('client-') || id.startsWith('help-');
};

// Function to get valid status values from the help_requests table
export const getValidHelpRequestStatuses = async () => {
  try {
    console.log('Checking valid status values for help_requests table...');
    
    // Get table constraint information
    const { data, error } = await supabase
      .rpc('get_table_info', { table_name: 'help_requests' });
      
    if (error) {
      console.error('Error getting help_requests table info:', error);
      return { success: false, error };
    }
    
    // Find the status constraint
    let statusConstraint = null;
    
    // Safely access the data structure with proper typechecking
    if (data && typeof data === 'object') {
      // Check if data has constraints property and it's an array
      if ('constraints' in data && 
          data.constraints && 
          Array.isArray(data.constraints)) {
        
        // Now search through constraints
        for (const constraint of data.constraints) {
          if (constraint && 
              typeof constraint === 'object' && 
              'constraint_name' in constraint && 
              'constraint_type' in constraint &&
              typeof constraint.constraint_name === 'string' &&
              constraint.constraint_name.includes('status') && 
              constraint.constraint_type === 'CHECK') {
            statusConstraint = constraint;
            break;
          }
        }
      }
    }
    
    console.log('Status constraint found:', statusConstraint);
    
    return { 
      success: true, 
      data, 
      statusConstraint 
    };
  } catch (error) {
    console.error('Exception checking valid status values:', error);
    return { success: false, error };
  }
};

// Function to check database constraints for a table
export const checkTableConstraints = async (tableName: string) => {
  try {
    const { data, error } = await supabase.rpc('get_table_info', { table_name: tableName });
    
    if (error) {
      console.error(`Error getting constraints for table ${tableName}:`, error);
      return { success: false, error: error.message };
    }
    
    console.log(`Constraints for table ${tableName}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Exception getting constraints for table ${tableName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Function to check the valid status values for the help_request_matches table
export const checkValidStatusValues = async () => {
  try {
    // This function would need to query the database to get information about the check constraint
    // For now, we'll log what we believe are the valid statuses
    console.log('Valid application statuses based on code:', 
      ['pending', 'approved', 'rejected', 'completed', 'cancelled']);
    
    return { 
      success: true, 
      data: ['pending', 'approved', 'rejected', 'completed', 'cancelled']
    };
  } catch (error) {
    console.error('Exception checking valid status values:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
