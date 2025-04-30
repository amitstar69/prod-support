
import { supabase } from '../client';
import { HelpRequest } from '../../../types/helpRequest';
import { isLocalId, isValidUUID, saveLocalHelpRequests, getLocalHelpRequests, handleError } from './utils';
import { toast } from 'sonner';
import { UserType } from '../../../contexts/auth/types';

// Core function to create a help request
export const createHelpRequest = async (
  helpRequest: Omit<HelpRequest, 'id' | 'created_at' | 'updated_at' | 'ticket_number'>,
  userType: UserType | null = null
) => {
  try {
    console.log('[createHelpRequest] Starting with userType:', userType);
    
    // Verify that only clients can create help requests
    if (userType !== 'client') {
      console.error(`[createHelpRequest] Permission denied - userType: ${userType}`);
      return { 
        success: false, 
        error: 'Permission denied: Only clients can create help requests' 
      };
    }
    
    const { client_id } = helpRequest;
    
    // Validate client ID
    if (!client_id) {
      return { success: false, error: 'Client ID is required' };
    }
    
    // Determine if we should use local storage or Supabase
    const useLocalStorage = isLocalId(client_id);
    const useSupabase = isValidUUID(client_id);
    
    if (!useLocalStorage && !useSupabase) {
      return { success: false, error: 'Invalid client ID format' };
    }
    
    // Normalize the attachments field to ensure it's always an array
    const normalizedAttachments = !helpRequest.attachments ? [] : 
                               typeof helpRequest.attachments === 'string' ? 
                               JSON.parse(helpRequest.attachments) : helpRequest.attachments;

    // Normalize required fields to ensure they meet the database constraints
    const normalizedHelpRequest = {
      ...helpRequest,
      client_id: client_id, // Ensure client_id is explicitly set
      attachments: normalizedAttachments,
      budget_range: helpRequest.budget_range || '$0 - $50', // Provide a default value
      technical_area: Array.isArray(helpRequest.technical_area) ? 
                      helpRequest.technical_area : 
                      [], // Ensure it's an array
      urgency: helpRequest.urgency || 'low', // Provide a default value
      communication_preference: Array.isArray(helpRequest.communication_preference) ? 
                              helpRequest.communication_preference : 
                              ['Chat'], // Ensure it's an array
      // Ensure required fields always have values
      title: helpRequest.title || "Untitled Request",
      description: helpRequest.description || "No description provided"
    };
    
    // For local storage
    if (useLocalStorage) {
      const localHelpRequests = getLocalHelpRequests();
      
      // Generate a ticket number for local storage (simulating the DB sequence)
      const existingNumbers = localHelpRequests.map((req: HelpRequest) => 
        req.ticket_number || 0
      );
      const maxNumber = Math.max(0, ...existingNumbers);
      const newTicketNumber = maxNumber >= 1000 ? maxNumber + 1 : 1000;
      
      const newRequest = {
        ...normalizedHelpRequest,
        id: `help-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'open',
        ticket_number: newTicketNumber
      };
      
      localHelpRequests.push(newRequest);
      saveLocalHelpRequests(localHelpRequests);
      console.log('Help request stored locally:', newRequest);
      
      return { success: true, data: newRequest, storageMethod: 'localStorage' };
    }
    
    // For Supabase
    const requestData = { 
      ...normalizedHelpRequest,
      status: 'open' // Set default status to 'open'
    };
    
    // Ensure we don't include undefined or null values for required fields
    if (!requestData.title) requestData.title = "Untitled Request";
    if (!requestData.description) requestData.description = "No description provided";
    
    const { data, error } = await supabase
      .from('help_requests')
      .insert(requestData)
      .select();
      
    if (error) {
      console.error('Error creating help request in Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Help request created successfully in Supabase:', data);
    return { success: true, data: data[0], storageMethod: 'Supabase' };
    
  } catch (error) {
    return handleError(error, 'Exception creating help request:');
  }
};
