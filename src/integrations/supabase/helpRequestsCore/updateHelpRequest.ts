import { supabase } from '../client';
import { HelpRequest } from '../../../types/helpRequest';
import { isLocalId, isValidUUID, getLocalHelpRequests, saveLocalHelpRequests, handleError } from './utils';
import { isValidTransition } from '../../../utils/statusTransitions';

export const updateHelpRequest = async (
  requestId: string,
  updates: Partial<Omit<HelpRequest, 'ticket_number'>>,
  userType: 'client' | 'developer' | 'system'
) => {
  try {
    console.log(`[updateHelpRequest] Starting update for requestId: ${requestId}, userType: ${userType}`);
    console.log('[updateHelpRequest] Updates:', JSON.stringify(updates));

    if (isLocalId(requestId)) {
      const localHelpRequests = getLocalHelpRequests();
      const requestIndex = localHelpRequests.findIndex(
        (request: HelpRequest) => request.id === requestId
      );

      if (requestIndex === -1) {
        console.error(`[updateHelpRequest] Help request not found in local storage: ${requestId}`);
        return { success: false, error: 'Help request not found in local storage' };
      }

      const updatedRequest = {
        ...localHelpRequests[requestIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      localHelpRequests[requestIndex] = updatedRequest;
      saveLocalHelpRequests(localHelpRequests);

      console.log('[updateHelpRequest] Successfully updated local storage request');
      return { success: true, data: updatedRequest, storageMethod: 'localStorage' };
    }

    if (isValidUUID(requestId)) {
      console.log(`[updateHelpRequest] Valid UUID detected: ${requestId}`);

      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id;
      
      if (!currentUserId) {
        console.error('[updateHelpRequest] No authenticated user found');
        return { success: false, error: 'You must be authenticated to update a help request' };
      }
      
      const { data: currentRequest, error: fetchError } = await supabase
        .from('help_requests')
        .select('status, client_id')
        .eq('id', requestId)
        .maybeSingle();

      if (fetchError) {
        console.error('[updateHelpRequest] Error fetching current help request:', fetchError);
        return { success: false, error: `Failed to validate status transition: ${fetchError.message}` };
      }

      if (!currentRequest) {
        console.error(`[updateHelpRequest] Help request not found: ${requestId}`);
        
        const { data: requestExists } = await supabase
          .from('help_requests')
          .select('id')
          .eq('id', requestId)
          .maybeSingle();
          
        if (requestExists) {
          return { 
            success: false, 
            error: `You don't have permission to update this help request.`
          };
        } else {
          return { 
            success: false, 
            error: `Help request not found.`
          };
        }
      }

      console.log('[updateHelpRequest] Found current request:', currentRequest);

      let permissionError: string | null = null;
      
      if (userType === 'client') {
        if (currentRequest.client_id !== currentUserId) {
          permissionError = 'You can only update help requests that you created';
          console.error(`[updateHelpRequest] Client ${currentUserId} does not own request ${requestId}`);
        }
      }
      else if (userType === 'developer') {
        const { data: matchData, error: matchError } = await supabase
          .from('help_request_matches')
          .select('status')
          .eq('request_id', requestId)
          .eq('developer_id', currentUserId)
          .maybeSingle();
          
        if (matchError) {
          console.error('[updateHelpRequest] Error checking developer match:', matchError);
          return { 
            success: false, 
            error: `Error verifying your assignment to this help request.` 
          };
        }
        
        if (!matchData) {
          console.error('[updateHelpRequest] Developer not matched with this request');
          return { 
            success: false, 
            error: `You are not assigned to this help request. Please request assignment first.` 
          };
        }
        
        if (matchData.status === 'pending' && updates.status &&
            updates.status !== 'dev_requested' && updates.status !== 'abandoned_by_dev') {
          console.error('[updateHelpRequest] Developer match not approved:', matchData.status);
          permissionError = 'Your application to this help request is pending. You must be approved by the client before updating its status.';
        }
        
        if (matchData.status === 'rejected') {
          console.error('[updateHelpRequest] Developer match not approved:', matchData.status);
          permissionError = 'Your application to this help request was rejected. You cannot update this request.';
        }
        
        if (matchData.status !== 'approved' && (
              updates.status !== 'dev_requested' && updates.status !== 'abandoned_by_dev')) {
          console.error('[updateHelpRequest] Developer match not approved:', matchData.status);
          permissionError = 'You are not approved for this request. Only assignment or abandonment is allowed.';
        }
      }

      if (permissionError) {
        return { success: false, error: permissionError };
      }

      const normalizedCurrentStatus = currentRequest.status.replace(/[-_]/g, '_');
      
      if (updates.status) {
        const normalizedNewStatus = updates.status.replace(/[-_]/g, '_');
        
        updates.status = normalizedNewStatus;
        
        if (normalizedCurrentStatus === normalizedNewStatus) {
          console.log('[updateHelpRequest] Status unchanged after normalization, skipping update');
          return { 
            success: true, 
            data: { ...currentRequest, ...updates }, 
            message: 'Status is already set to this value'
          };
        }
        
        if (!isValidTransition(normalizedCurrentStatus, normalizedNewStatus, userType)) {
          console.error(`[updateHelpRequest] Invalid status transition from ${normalizedCurrentStatus} to ${normalizedNewStatus} by ${userType}`);
          return { 
            success: false, 
            error: `Invalid status transition from "${normalizedCurrentStatus}" to "${normalizedNewStatus}". This action is not allowed.` 
          };
        }
        
        console.log(`[updateHelpRequest] Status transition validated: ${normalizedCurrentStatus} -> ${updates.status}`);
      }

      const now = new Date().toISOString();
      
      if (updates.status) {
        switch(updates.status.replace(/[-_]/g, '_')) {
          case 'ready_for_qa':
            updates.qa_start_time = now;
            break;
          case 'qa_feedback':
            updates.client_review_start_time = now;
            break;
          case 'complete':
            updates.client_review_complete_time = now;
            break;
        }
      }

      const dbUsesHyphens = currentRequest.status.includes('-');
      
      if (dbUsesHyphens) {
        updates.status = updates.status.replace(/_/g, '-');
        console.log(`[updateHelpRequest] Converted status format to hyphen: ${updates.status}`);
      } else {
        updates.status = updates.status.replace(/-/g, '_');
        console.log(`[updateHelpRequest] Converted status format to underscore: ${updates.status}`);
      }

      console.log('[updateHelpRequest] Sending update to Supabase:', updates);
      const { data, error } = await supabase
        .from('help_requests')
        .update({
          ...updates,
          updated_at: now
        })
        .eq('id', requestId)
        .select('*')  
        .maybeSingle();
        
      if (error) {
        console.error('[updateHelpRequest] Error updating help request in Supabase:', error);
        return { success: false, error: `Database update failed: ${error.message}` };
      }

      if (!data) {
        console.error('[updateHelpRequest] No data returned after update');
        const { data: checkExists } = await supabase
          .from('help_requests')
          .select('id')
          .eq('id', requestId)
          .maybeSingle();
          
        if (!checkExists) {
          return { success: false, error: 'Help request not found' };
        } else {
          return { success: false, error: 'Update failed - no changes were made' };
        }
      }
      
      console.log('[updateHelpRequest] Update successful, data:', data);
      
      if (updates.status && updates.status !== currentRequest.status) {
        try {
          const historyEntry = {
            help_request_id: requestId,
            change_type: 'STATUS_CHANGE',
            previous_status: currentRequest.status,
            new_status: updates.status,
            changed_by: currentUserId,
            change_details: {
              updated_by_type: userType,
              timestamp: now
            }
          };

          console.log('[updateHelpRequest] Creating history entry:', historyEntry);
          const { error: historyError } = await supabase
            .from('help_request_history')
            .insert(historyEntry);
            
          if (historyError) {
            console.error('[updateHelpRequest] Error creating history entry:', historyError);
          }
        } catch (historyError) {
          console.error('[updateHelpRequest] Exception in history creation:', historyError);
        }
      }
      
      return { success: true, data, storageMethod: 'Supabase' };
    }
    
    console.error(`[updateHelpRequest] Invalid help request ID format: ${requestId}`);
    return { success: false, error: 'Invalid help request ID format' };
    
  } catch (error) {
    return handleError(error, 'Exception updating help request:');
  }
};
