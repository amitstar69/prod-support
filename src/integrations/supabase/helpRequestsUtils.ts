
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
