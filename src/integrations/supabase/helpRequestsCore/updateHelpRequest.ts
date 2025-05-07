
import { supabase } from '../client';
import { HelpRequest, UserType } from '../../../types/helpRequest';
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
        .select('status, client_id, selected_developer_id')
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
      
      // Add guard for client_id and selected_developer_id
      let newClientId = null;
      let newDevId = null;
      
      if (currentRequest && typeof currentRequest === 'object' && !('code' in currentRequest)) {
        newClientId = currentRequest.client_id;
        newDevId = currentRequest.selected_developer_id;
      } else {
        console.warn('updateHelpRequest join error', currentRequest);
      }
      
      if (userType === 'client') {
        if (newClientId !== currentUserId) {
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
        
        const matchStatus = matchData && typeof matchData === 'object' && !('code' in matchData) ? matchData.status : null;
        
        if (matchStatus === 'pending' && updates.status &&
            updates.status !== 'dev_requested' && updates.status !== 'abandoned_by_dev') {
          console.error('[updateHelpRequest] Developer match not approved:', matchStatus);
          permissionError = 'Your application to this help request is pending. You must be approved by the client before updating its status.';
        }
        
        if (matchStatus === 'rejected') {
          console.error('[updateHelpRequest] Developer match not approved:', matchStatus);
          permissionError = 'Your application to this help request was rejected. You cannot update this request.';
        }
        
        if (matchStatus !== 'approved' && (
              updates.status !== 'dev_requested' && updates.status !== 'abandoned_by_dev')) {
          console.error('[updateHelpRequest] Developer match not approved:', matchStatus);
          permissionError = 'You are not approved for this request. Only assignment or abandonment is allowed.';
        }
      }

      if (permissionError) {
        return { success: false, error: permissionError };
      }

      // Safe access to currentRequest
      if (!currentRequest || !('status' in currentRequest)) {
        console.error('[updateHelpRequest] currentRequest missing status property', currentRequest);
        return { success: false, error: 'Invalid request data format' };
      }
      
      const normalizedCurrentStatus = typeof currentRequest.status === 'string' 
        ? currentRequest.status.replace(/[-_]/g, '_')
        : String(currentRequest.status);
      
      if (updates.status) {
        const normalizedNewStatus = updates.status.replace(/[-_]/g, '_');
        
        updates.status = normalizedNewStatus;
        
        if (normalizedCurrentStatus === normalizedNewStatus) {
          console.log('[updateHelpRequest] Status unchanged after normalization, skipping update');
          return { 
            success: true, 
            data: { 
              ...((typeof currentRequest === 'object' && !('code' in currentRequest)) ? currentRequest : {}),
              ...updates
            }, 
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

      // Safe access to check if status contains hyphen
      const dbUsesHyphens = currentRequest && typeof currentRequest === 'object' && 
        'status' in currentRequest && typeof currentRequest.status === 'string' && 
        currentRequest.status.includes('-');
      
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
        .eq('id', requestId);
        
      if (error) {
        console.error('[updateHelpRequest] Error updating help request in Supabase:', error);
        return { success: false, error: `Database update failed: ${error.message}` };
      }

      // Check if the update was successful even if no data was returned
      const { data: checkData } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', requestId)
        .maybeSingle();
          
      if (!checkData) {
        console.error('[updateHelpRequest] No data returned after check query');
        return { success: false, error: 'Help request not found' };
      }
      
      console.log('[updateHelpRequest] Update successful, data:', checkData);
      
      if (updates.status && currentRequest && 'status' in currentRequest && updates.status !== currentRequest.status) {
        try {
          const historyEntry = {
            help_request_id: requestId,
            change_type: 'STATUS_CHANGE',
            previous_status: String(currentRequest.status || ''),
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
      
      return { success: true, data: checkData, storageMethod: 'Supabase' };
    }
    
    console.error(`[updateHelpRequest] Invalid help request ID format: ${requestId}`);
    return { success: false, error: 'Invalid help request ID format' };
    
  } catch (error) {
    return handleError(error, 'Exception updating help request:');
  }
};

export const updateHelpRequestStatus = async (
  requestId: string,
  newStatus: string,
  userId: string,
  userType: UserType | null = null
) => {
  try {
    console.log(`[updateHelpRequestStatus] Starting with requestId: ${requestId}, newStatus: ${newStatus}, userId: ${userId}, userType: ${userType}`);
    
    if (!requestId) {
      return { success: false, error: 'Request ID is required' };
    }
    
    if (!newStatus) {
      return { success: false, error: 'New status is required' };
    }
    
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }
    
    // Determine if we should use local storage or Supabase
    const useLocalStorage = isLocalId(requestId) || isLocalId(userId);
    const useSupabase = isValidUUID(requestId) && isValidUUID(userId);
    
    if (!useLocalStorage && !useSupabase) {
      return { success: false, error: 'Invalid ID format' };
    }
    
    // For local storage (development/demo mode)
    if (useLocalStorage) {
      const localHelpRequests = getLocalHelpRequests();
      
      const index = localHelpRequests.findIndex(req => req.id === requestId);
      
      if (index === -1) {
        return { success: false, error: 'Help request not found' };
      }
      
      // Validate status change permission
      if (userType === 'client' && userId !== localHelpRequests[index].client_id) {
        return { success: false, error: 'You do not have permission to update this help request' };
      }
      
      // Update status and save
      localHelpRequests[index] = {
        ...localHelpRequests[index],
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      saveLocalHelpRequests(localHelpRequests);
      
      console.log(`[updateHelpRequestStatus] Local help request status updated to ${newStatus}`);
      
      return { 
        success: true, 
        data: localHelpRequests[index],
        storageMethod: 'localStorage'
      };
    }
    
    // For Supabase
    try {
      // First, fetch current status
      const { data: currentRequest, error: fetchError } = await supabase
        .from('help_requests')
        .select('status, client_id, selected_developer_id')
        .eq('id', requestId)
        .single();
      
      if (fetchError || !currentRequest) {
        return { success: false, error: fetchError?.message || 'Request not found' };
      }
      
      // Validate permission to update
      if (userType === 'client' && userId !== currentRequest.client_id) {
        return { success: false, error: 'You do not have permission to update this help request' };
      }
      
      if (userType === 'developer' && userId !== currentRequest.selected_developer_id) {
        // Check if this is an assigned developer
        const { data: matchData, error: matchError } = await supabase
          .from('help_request_matches')
          .select('status')
          .eq('request_id', requestId)
          .eq('developer_id', userId)
          .eq('status', 'approved')
          .maybeSingle();
        
        const isApprovedDeveloper = matchData && typeof matchData === 'object' && !('code' in matchData);
        
        if (matchError || !isApprovedDeveloper) {
          return { success: false, error: 'You are not assigned to this help request' };
        }
      }
      
      // Update the status
      const { data, error } = await supabase
        .from('help_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select();
      
      if (error) {
        console.error('Error updating help request status in Supabase:', error);
        return { success: false, error: error.message };
      }
      
      console.log(`[updateHelpRequestStatus] Supabase help request status updated to ${newStatus}:`, data);
      
      return { success: true, data: data[0], storageMethod: 'Supabase' };
    } catch (error) {
      return handleError(error, 'Exception updating help request status in Supabase:');
    }
  } catch (error) {
    return handleError(error, 'Exception in updateHelpRequestStatus:');
  }
};
