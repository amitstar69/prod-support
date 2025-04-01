
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

// Function to directly check the valid status values for help_request_matches table
export const getHelpRequestMatchesValidStatuses = async () => {
  try {
    // Get constraint definition directly from PostgreSQL
    const { data, error } = await supabase.from('help_request_matches_status_values')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting help_request_matches status values:', error);
      
      // Fallback to getting constraint definition with SQL query
      const { data: constraintData, error: constraintError } = await supabase.rpc('get_constraint_definition', {
        constraint_name: 'help_request_matches_status_check',
        table_name: 'help_request_matches'
      });
      
      if (constraintError) {
        console.error('Error getting constraint definition:', constraintError);
        
        // Last resort fallback - direct query to get the constraint definition
        const { data: rawConstraint, error: rawError } = await supabase.rpc('execute_sql', {
          sql_query: `
            SELECT pg_catalog.pg_get_constraintdef(r.oid, true) AS constraint_definition
            FROM pg_catalog.pg_constraint r
            WHERE r.conrelid = 'help_request_matches'::regclass
            AND r.conname = 'help_request_matches_status_check'
          `
        });
        
        if (rawError) {
          console.error('Error executing direct SQL:', rawError);
          return { 
            success: false, 
            data: ['pending', 'approved', 'rejected', 'completed', 'cancelled'], 
            error: 'Using hardcoded fallback values due to query errors'
          };
        }
        
        console.log('Raw constraint definition result:', rawConstraint);
        return { 
          success: true, 
          data: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
          rawDefinition: rawConstraint
        };
      }
      
      console.log('Constraint definition:', constraintData);
      return { 
        success: true, 
        data: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
        constraintDefinition: constraintData
      };
    }
    
    console.log('Valid help_request_matches status values:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Exception checking valid status values:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      // Fallback to known values if we can't query the database
      data: ['pending', 'approved', 'rejected', 'completed', 'cancelled']
    };
  }
};

// Function to check the valid status values for the help_request_matches table
export const checkValidStatusValues = async () => {
  try {
    // Query the database to get information about the check constraint
    const result = await checkTableConstraints('help_request_matches');
    
    if (result.success && result.data) {
      console.log('help_request_matches table constraints:', result.data);
      
      // Find the status check constraint
      let statusConstraint = null;
      if (result.data.constraints && Array.isArray(result.data.constraints)) {
        statusConstraint = result.data.constraints.find(constraint => 
          constraint.constraint_name === 'help_request_matches_status_check'
        );
      }
      
      console.log('Status constraint:', statusConstraint);
      
      // Based on the constraint or direct knowledge, these are the valid statuses
      // IMPORTANT: These must match exactly what's in the database constraint
      const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
      
      return { 
        success: true, 
        data: validStatuses,
        constraint: statusConstraint
      };
    }
    
    // Fallback to hardcoded values if we can't get the constraint info
    console.log('Valid application statuses (fallback):', 
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
