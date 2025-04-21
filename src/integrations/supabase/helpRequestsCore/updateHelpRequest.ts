import { supabase } from '../client';
import { HelpRequest } from '../../../types/helpRequest';
import { isLocalId, isValidUUID, getLocalHelpRequests, saveLocalHelpRequests, handleError } from './utils';
import { getUserHomeRoute } from '../../../contexts/auth/authUtils';
import { isValidStatusTransition, getStatusLabel } from '../../../utils/helpRequestStatusUtils';

export const updateHelpRequest = async (
  requestId: string,
  updates: Partial<Omit<HelpRequest, 'ticket_number'>>,
  userType: 'client' | 'developer'
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

      // Get current user ID
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id;
      
      if (!currentUserId) {
        console.error('[updateHelpRequest] No authenticated user found');
        return { success: false, error: 'You must be authenticated to update a help request' };
      }
      
      // First, get the current state of the help request
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
        
        // Check if request exists at all to provide better error messages
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

      // === Permission checks based on user type ===
      let permissionError: string | null = null;
      
      // Check client permissions
      if (userType === 'client') {
        // Client can only update their own requests
        if (currentRequest.client_id !== currentUserId) {
          permissionError = 'You can only update help requests that you created';
          console.error(`[updateHelpRequest] Client ${currentUserId} does not own request ${requestId}`);
        }
      }
      
      // Check developer permissions
      else if (userType === 'developer') {
        // Developer must be matched with this request to update it
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
        
        // Developer must be assigned to this request
        if (!matchData) {
          console.error('[updateHelpRequest] Developer not matched with this request');
          
          return { 
            success: false, 
            error: `You are not assigned to this help request. Please request assignment first.` 
          };
        }
        
        // If the match is not approved (still pending), developer can't update
        // except for specific allowed cases
        if (matchData.status !== 'approved' && 
            updates.status !== 'dev_requested' && 
            updates.status !== 'abandoned_by_dev') {
          console.error('[updateHelpRequest] Developer match not approved:', matchData.status);
          permissionError = `Your application to this help request is ${matchData.status}. You need approved status to update it.`;
        }
      }

      // Return early if there's a permission error
      if (permissionError) {
        return { success: false, error: permissionError };
      }

      // Check status transition validity if status is being updated
      if (updates.status && currentRequest.status !== updates.status) {
        // Validate the status transition based on user role
        if (!isValidStatusTransition(currentRequest.status, updates.status, userType)) {
          const fromStatus = getStatusLabel(currentRequest.status);
          const toStatus = getStatusLabel(updates.status);
          
          console.error(`[updateHelpRequest] Invalid status transition from ${currentRequest.status} to ${updates.status} by ${userType}`);
          return { 
            success: false, 
            error: `Invalid status transition from "${fromStatus}" to "${toStatus}". This action is not allowed.` 
          };
        }
        
        console.log(`[updateHelpRequest] Status transition validated: ${currentRequest.status} -> ${updates.status}`);
      }

      // Update timestamp fields based on status changes
      const now = new Date().toISOString();
      
      if (updates.status) {
        // Add appropriate timestamps based on status transitions
        switch(updates.status) {
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

      // Perform the update
      console.log('[updateHelpRequest] Sending update to Supabase:', updates);
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
        console.error('[updateHelpRequest] Error updating help request in Supabase:', error);
        return { success: false, error: `Database update failed: ${error.message}` };
      }

      if (!data) {
        console.error('[updateHelpRequest] No data returned after update');
        return { success: false, error: 'Help request not found or update failed' };
      }
      
      console.log('[updateHelpRequest] Update successful, data:', data);
      
      // Log history entry for status changes
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
