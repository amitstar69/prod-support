
import { supabase } from '../client';
import { HelpRequest } from '../../../types/helpRequest';
import { isLocalId, isValidUUID, getLocalHelpRequests, saveLocalHelpRequests, handleError } from './utils';

// Function to update a help request
export const updateHelpRequest = async (requestId: string, updates: Partial<Omit<HelpRequest, 'ticket_number'>>) => {
  try {
    // For local help request ID
    if (requestId.startsWith('help-')) {
      const localHelpRequests = getLocalHelpRequests();
      const requestIndex = localHelpRequests.findIndex(
        (request: HelpRequest) => request.id === requestId
      );
      
      if (requestIndex === -1) {
        return { success: false, error: 'Help request not found in local storage' };
      }
      
      const updatedRequest = {
        ...localHelpRequests[requestIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      localHelpRequests[requestIndex] = updatedRequest;
      saveLocalHelpRequests(localHelpRequests);
      
      return { success: true, data: updatedRequest, storageMethod: 'localStorage' };
    }
    
    // For Supabase help request ID
    if (isValidUUID(requestId)) {
      const { data, error } = await supabase
        .from('help_requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating help request in Supabase:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data, storageMethod: 'Supabase' };
    }
    
    // Invalid request ID format
    return { success: false, error: 'Invalid help request ID format' };
    
  } catch (error) {
    return handleError(error, 'Exception updating help request:');
  }
};
