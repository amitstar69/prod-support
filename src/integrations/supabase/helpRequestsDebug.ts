
import { supabase } from './client';
import { HelpRequest } from '../../types/helpRequest';
import { ApiResponse } from './helpRequests';

/**
 * Debug function to inspect all help requests in the system
 * This is for development and debugging only
 */
export const debugInspectHelpRequests = async (): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error inspecting help requests:', error);
      return { success: false, error: error.message };
    }
    
    return data;
  } catch (error) {
    console.error('Exception in debugInspectHelpRequests:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Create a test help request for debugging purposes
 */
export const createTestHelpRequest = async (
  requestData: Omit<HelpRequest, "id" | "created_at" | "updated_at">
): Promise<ApiResponse<HelpRequest>> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .insert([requestData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating test help request:', error);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      data: data as HelpRequest 
    };
  } catch (error) {
    console.error('Exception in createTestHelpRequest:', error);
    return { success: false, error: String(error) };
  }
};
