import { supabase } from './client';
import { HelpRequest, HelpRequestMatch, HelpRequestStatus } from '../../types/helpRequest';
import { toast } from 'sonner';

// Type definitions for response objects
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}

// Create a new help request
export const createHelpRequest = async (helpRequest: Omit<HelpRequest, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<HelpRequest>> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .insert(helpRequest)
      .select()
      .single();

    if (error) {
      console.error('Error creating help request:', error);
      return { success: false, error: error.message };
    }

    // Cast the status to HelpRequestStatus to satisfy TypeScript
    const typedData = {
      ...data,
      status: data.status as HelpRequestStatus
    } as HelpRequest;

    return { success: true, data: typedData };
  } catch (error) {
    console.error('Exception creating help request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Cancel a help request
export const cancelHelpRequest = async (requestId: string): Promise<ApiResponse<any>> => {
  try {
    const { error } = await supabase
      .from('help_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId);
      
    if (error) {
      console.error('Error cancelling help request:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: { id: requestId, status: 'cancelled' } };
  } catch (error) {
    console.error('Exception in cancelHelpRequest:', error);
    return { success: false, error: String(error) };
  }
};

// Get all help requests for a client
export const getClientHelpRequests = async (clientId: string): Promise<ApiResponse<HelpRequest[]>> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select(`
        *,
        applications:help_request_matches(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client help requests:', error);
      return { success: false, error: error.message };
    }

    // Cast the status to HelpRequestStatus to satisfy TypeScript
    const typedData = data.map(item => ({
      ...item,
      status: item.status as HelpRequestStatus
    })) as HelpRequest[];

    return { success: true, data: typedData };
  } catch (error) {
    console.error('Exception fetching client help requests:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Get a specific help request by ID
export const getHelpRequestById = async (requestId: string): Promise<ApiResponse<HelpRequest>> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select(`
        *,
        applications:help_request_matches(*, developer:developer_id(id, name, image))
      `)
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('Error fetching help request:', error);
      return { success: false, error: error.message };
    }

    // Cast the status to HelpRequestStatus to satisfy TypeScript
    const typedData = {
      ...data,
      status: data.status as HelpRequestStatus
    } as HelpRequest;

    return { success: true, data: typedData };
  } catch (error) {
    console.error('Exception fetching help request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Update a help request
export const updateHelpRequest = async (requestId: string, updates: Partial<HelpRequest>): Promise<ApiResponse<HelpRequest>> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating help request:', error);
      return { success: false, error: error.message };
    }

    // Cast the status to HelpRequestStatus to satisfy TypeScript
    const typedData = {
      ...data,
      status: data.status as HelpRequestStatus
    } as HelpRequest;

    return { success: true, data: typedData };
  } catch (error) {
    console.error('Exception updating help request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Delete a help request
export const deleteHelpRequest = async (requestId: string): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase
      .from('help_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error deleting help request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception deleting help request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Submit a developer application for a help request
export const submitDeveloperApplication = async (
  requestId: string, 
  developerId: string,
  applicationData?: {
    proposed_message?: string;
    proposed_duration?: number;
    proposed_rate?: number;
  }
): Promise<ApiResponse<HelpRequestMatch>> => {
  try {
    // Check if an application already exists
    const { data: existingData, error: existingError } = await supabase
      .from('help_request_matches')
      .select('*')
      .eq('request_id', requestId)
      .eq('developer_id', developerId)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing application:', existingError);
      return { success: false, error: existingError.message };
    }

    let result;

    if (existingData) {
      // Update existing application
      const { data, error } = await supabase
        .from('help_request_matches')
        .update({
          proposed_message: applicationData?.proposed_message,
          proposed_duration: applicationData?.proposed_duration,
          proposed_rate: applicationData?.proposed_rate,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating application:', error);
        return { success: false, error: error.message };
      }

      result = data;
    } else {
      // Create new application
      const { data, error } = await supabase
        .from('help_request_matches')
        .insert({
          request_id: requestId,
          developer_id: developerId,
          proposed_message: applicationData?.proposed_message,
          proposed_duration: applicationData?.proposed_duration,
          proposed_rate: applicationData?.proposed_rate,
          status: 'pending',
          match_score: 0.8 // Default score for now
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating application:', error);
        return { success: false, error: error.message };
      }

      result = data;
    }

    return { success: true, data: result as HelpRequestMatch };
  } catch (error) {
    console.error('Exception submitting application:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Get all public help requests
export const getAllPublicHelpRequests = async (): Promise<ApiResponse<HelpRequest[]>> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public help requests:', error);
      return { success: false, error: error.message };
    }

    // Cast the status to HelpRequestStatus to satisfy TypeScript
    const typedData = data.map(item => ({
      ...item,
      status: item.status as HelpRequestStatus
    })) as HelpRequest[];

    return { success: true, data: typedData };
  } catch (error) {
    console.error('Exception fetching public help requests:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const testDatabaseAccess = async (): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Error testing database access:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: { count: data.length } };
  } catch (error) {
    console.error('Exception testing database access:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Add session-related functions that are missing
export const startHelpSession = async (sessionId: string): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('help_sessions')
      .update({ 
        status: 'active', 
        actual_start: new Date().toISOString() 
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error starting help session:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception in startHelpSession:', error);
    return { success: false, error: String(error) };
  }
};

export const endHelpSession = async (sessionId: string): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('help_sessions')
      .update({ 
        status: 'completed', 
        actual_end: new Date().toISOString() 
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error ending help session:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception in endHelpSession:', error);
    return { success: false, error: String(error) };
  }
};

export const getHelpSessionDetails = async (sessionId: string): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('help_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching help session details:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception in getHelpSessionDetails:', error);
    return { success: false, error: String(error) };
  }
};

export const sendMessage = async (
  sessionId: string, 
  content: string, 
  senderId: string, 
  senderType: string,
  isCode: boolean,
  attachmentUrl: string | null
): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('session_messages')
      .insert({
        session_id: sessionId,
        sender_id: senderId,
        sender_type: senderType,
        content,
        is_code: isCode,
        attachment_url: attachmentUrl
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception in sendMessage:', error);
    return { success: false, error: String(error) };
  }
};

export const getSessionMessages = async (sessionId: string): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching session messages:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception in getSessionMessages:', error);
    return { success: false, error: String(error) };
  }
};
