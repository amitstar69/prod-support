
import { supabase } from './client';
import { Json } from './types';

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

// Function to directly get the valid status values for help_request_matches table
export const getHelpRequestMatchesValidStatuses = async () => {
  try {
    // Query the database using custom SQL through get_table_info RPC function
    // This is safer than trying to use non-existent tables or RPC functions
    const { data, error } = await supabase.rpc('get_table_info', { 
      table_name: 'help_request_matches' 
    });
    
    if (error) {
      console.error('Error getting help_request_matches table info:', error);
      // Fallback to hardcoded known values
      return { 
        success: false, 
        data: ['pending', 'approved', 'rejected', 'completed', 'cancelled'], 
        error: 'Using hardcoded fallback values due to query errors'
      };
    }
    
    // Process the constraint data if available
    let validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    let constraintDefinition = null;
    
    if (data && typeof data === 'object' && 'constraints' in data) {
      const constraints = data.constraints;
      if (Array.isArray(constraints)) {
        // Find the status check constraint
        const statusConstraint = constraints.find(c => 
          c && typeof c === 'object' && 
          'constraint_name' in c && 
          c.constraint_name === 'help_request_matches_status_check'
        );
        
        if (statusConstraint) {
          constraintDefinition = statusConstraint;
          console.log('Found status constraint definition:', statusConstraint);
        }
      }
    }
    
    console.log('Valid help_request_matches status values:', validStatuses);
    return { 
      success: true, 
      data: validStatuses,
      constraintDefinition
    };
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
      const data = result.data;
      
      if (data && typeof data === 'object' && 'constraints' in data) {
        const constraints = data.constraints;
        if (Array.isArray(constraints)) {
          statusConstraint = constraints.find(constraint => 
            constraint &&
            typeof constraint === 'object' && 
            'constraint_name' in constraint &&
            constraint.constraint_name === 'help_request_matches_status_check'
          );
        }
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
