import { supabase } from '../client';
import { HelpRequest } from '../../../types/helpRequest';
import { isLocalId, isValidUUID, getLocalHelpRequests, saveLocalHelpRequests, handleError } from './utils';
import { getUserHomeRoute } from '../../../contexts/auth/authUtils';

const isValidStatusTransition = (currentStatus: string, newStatus: string, userType: string): boolean => {
  const developerTransitions: Record<string, string[]> = {
    'in-progress': ['developer-qa'],
    'developer-qa': ['client-review'],
    'client-approved': ['completed']
  };

  const clientTransitions: Record<string, string[]> = {
    'client-review': ['client-approved', 'in-progress'],
    'completed': ['in-progress']
  };

  const transitions = userType === 'developer' ? developerTransitions : clientTransitions;
  return transitions[currentStatus]?.includes(newStatus) || false;
};

export const updateHelpRequest = async (
  requestId: string,
  updates: Partial<Omit<HelpRequest, 'ticket_number'>>,
  userType: 'client' | 'developer'
) => {
  try {
    if (isLocalId(requestId)) {
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

    if (isValidUUID(requestId)) {
      if (updates.status) {
        const { data: currentRequest, error: fetchError } = await supabase
          .from('help_requests')
          .select('status')
          .eq('id', requestId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching current help request:', fetchError);
          return { success: false, error: 'Failed to validate status transition' };
        }

        if (!currentRequest) {
          return { success: false, error: 'Help request not found' };
        }

        if (!isValidStatusTransition(currentRequest.status, updates.status, userType)) {
          return { 
            success: false, 
            error: `Invalid status transition from ${currentRequest.status} to ${updates.status}` 
          };
        }
      }

      const now = new Date().toISOString();
      
      if (updates.status) {
        switch(updates.status) {
          case 'developer-qa':
            updates.qa_start_time = now;
            break;
          case 'client-review':
            updates.client_review_start_time = now;
            break;
          case 'client-approved':
            updates.client_review_complete_time = now;
            break;
          case 'completed':
            updates.updated_at = now;
            break;
        }
      }

      const { data, error } = await supabase
        .from('help_requests')
        .update({
          ...updates,
          updated_at: now
        })
        .eq('id', requestId)
        .select()
        .maybeSingle();
        
      if (error) {
        console.error('Error updating help request in Supabase:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Help request not found' };
      }
      
      if (updates.status) {
        const historyEntry = {
          help_request_id: requestId,
          change_type: 'STATUS_CHANGE',
          previous_status: data.status,
          new_status: updates.status,
          change_details: {
            updated_by_type: userType,
            timestamp: now
          }
        };

        await supabase
          .from('help_request_history')
          .insert(historyEntry);
      }
      
      return { success: true, data, storageMethod: 'Supabase' };
    }
    
    return { success: false, error: 'Invalid help request ID format' };
    
  } catch (error) {
    return handleError(error, 'Exception updating help request:');
  }
};
