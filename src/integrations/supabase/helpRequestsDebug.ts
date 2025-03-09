
import { supabase } from './client';
import { HelpRequest, HelpRequestStatus } from '../../types/helpRequest';
import { toast } from 'sonner';

// Type definitions for response objects
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}

// Debug function to inspect help requests
export const inspectHelpRequests = async (): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select(`
        *,
        applications:help_request_matches(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error inspecting help requests:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception inspecting help requests:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Create a test help request for debugging
export const createTestHelpRequest = async (): Promise<ApiResponse<HelpRequest>> => {
  try {
    // Get the authenticated user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const testRequest = {
      client_id: user.id,
      title: `Test Request ${new Date().toLocaleTimeString()}`,
      description: 'This is an automatically generated test request for debugging purposes.',
      technical_area: ['Testing', 'Debugging'],
      urgency: 'medium',
      communication_preference: ['Chat'],
      estimated_duration: 30,
      budget_range: 'Under $50',
      code_snippet: '// Test code snippet\nconsole.log("Hello world!");',
      status: 'pending' as HelpRequestStatus
    };
    
    const { data, error } = await supabase
      .from('help_requests')
      .insert(testRequest)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating test help request:', error);
      return { success: false, error: error.message };
    }
    
    // Cast the status to HelpRequestStatus to satisfy TypeScript
    const typedData = {
      ...data,
      status: data.status as HelpRequestStatus
    } as HelpRequest;
    
    return { success: true, data: typedData };
  } catch (error) {
    console.error('Exception creating test help request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
