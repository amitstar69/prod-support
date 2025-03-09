
import { supabase } from './client';
import { HelpRequest, HelpRequestStatus } from '../../types/helpRequest';
import { toast } from 'sonner';
import { ApiResponse } from './helpRequests';

export const createSampleHelpRequest = async (): Promise<ApiResponse<HelpRequest>> => {
  try {
    const sampleRequest = {
      title: 'Sample Help Request',
      description: 'This is a sample help request created for testing',
      technical_area: ['Frontend', 'React'],
      urgency: 'Medium',
      budget_range: '$50 - $100',
      communication_preference: ['Chat', 'Video Call'],
      client_id: '12345',
      estimated_duration: 60,
      code_snippet: 'console.log("Hello World");',
      status: 'pending' as HelpRequestStatus
    };

    const { data, error } = await supabase
      .from('help_requests')
      .insert(sampleRequest)
      .select()
      .single();

    if (error) {
      console.error('Error creating sample help request:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        ...data,
        status: data.status as HelpRequestStatus
      } as HelpRequest
    };
  } catch (error) {
    console.error('Exception creating sample help request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const testHelpRequestStorage = async (): Promise<ApiResponse<any>> => {
  try {
    const { count, error } = await supabase
      .from('help_requests')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error testing help request storage:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: { count } };
  } catch (error) {
    console.error('Exception testing help request storage:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
