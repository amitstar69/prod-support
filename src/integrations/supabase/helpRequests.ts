
import { HelpRequest, HelpRequestMatch, HelpRequestStatus } from '../../types/helpRequest';
import { supabase } from './client';
import { toast } from 'sonner';

// Create a new help request
export const createHelpRequest = async (helpRequest: Omit<HelpRequest, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .insert({
        ...helpRequest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating help request:', error);
      toast.error('Failed to create help request');
      return { success: false, error: error.message };
    }

    toast.success('Help request created successfully');
    return { success: true, data: data as HelpRequest };
  } catch (error: any) {
    console.error('Exception creating help request:', error);
    toast.error('An unexpected error occurred');
    return { success: false, error: error.message };
  }
};

// Get all help requests for a client
export const getClientHelpRequests = async (clientId: string): Promise<HelpRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      console.error('Error fetching client help requests:', error);
      return [];
    }

    return (data || []) as HelpRequest[];
  } catch (error) {
    console.error('Exception fetching client help requests:', error);
    return [];
  }
};

// Get a specific help request by ID
export const getHelpRequestById = async (id: string): Promise<HelpRequest | null> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching help request:', error);
      return null;
    }

    return data as HelpRequest;
  } catch (error) {
    console.error('Exception fetching help request:', error);
    return null;
  }
};

// Update a help request
export const updateHelpRequest = async (id: string, updates: Partial<HelpRequest>) => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating help request:', error);
      toast.error('Failed to update help request');
      return null;
    }

    toast.success('Help request updated successfully');
    return data as HelpRequest;
  } catch (error) {
    console.error('Exception updating help request:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// Cancel a help request
export const cancelHelpRequest = async (id: string) => {
  try {
    const { error } = await supabase
      .from('help_requests')
      .update({ status: 'cancelled' as HelpRequestStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error cancelling help request:', error);
      toast.error('Failed to cancel help request');
      return false;
    }

    toast.success('Help request cancelled successfully');
    return true;
  } catch (error) {
    console.error('Exception cancelling help request:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};

// Get all matches for a help request
export const getHelpRequestMatches = async (requestId: string): Promise<HelpRequestMatch[]> => {
  try {
    const { data, error } = await supabase
      .from('help_request_matches')
      .select('*')
      .eq('request_id', requestId);

    if (error) {
      console.error('Error fetching help request matches:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching help request matches:', error);
    return [];
  }
};

// Create a new match for a help request
export const createHelpRequestMatch = async (match: Omit<HelpRequestMatch, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('help_request_matches')
      .insert({
        ...match,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating help request match:', error);
      toast.error('Failed to create help request match');
      return null;
    }

    toast.success('Help request match created successfully');
    return data;
  } catch (error) {
    console.error('Exception creating help request match:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// Added missing functions for useTicketApplications and useTicketFetching
export const submitDeveloperApplication = async (
  requestId: string,
  developerId: string,
  applicationData: {
    proposed_message?: string;
    proposed_duration?: number;
    proposed_rate?: number;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('help_request_matches')
      .insert({
        request_id: requestId,
        developer_id: developerId,
        proposed_message: applicationData.proposed_message || '',
        proposed_duration: applicationData.proposed_duration || 0,
        proposed_rate: applicationData.proposed_rate || 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting developer application:', error);
      return { success: false, error: error.message };
    }

    // Update the help request status to "matching"
    await supabase
      .from('help_requests')
      .update({ 
        status: 'matching' as HelpRequestStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    return { success: true, data };
  } catch (error: any) {
    console.error('Exception submitting developer application:', error);
    return { success: false, error: error.message };
  }
};

// Testing functions for debugging
export const getAllPublicHelpRequests = async (isAuthenticated: boolean) => {
  try {
    // For authenticated users, fetch real data
    if (isAuthenticated) {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*, client:client_id(id, name, image), applications:help_request_matches(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching help requests:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as HelpRequest[] };
    } else {
      // For non-authenticated users, return a safe error
      return { success: false, error: 'Authentication required' };
    }
  } catch (error: any) {
    console.error('Exception fetching help requests:', error);
    return { success: false, error: error.message };
  }
};

export const testDatabaseAccess = async () => {
  try {
    const { count, error } = await supabase
      .from('help_requests')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Debug functions for DebugHelpRequestDatabase component
export const debugInspectHelpRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error inspecting help requests:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data as HelpRequest[], count: data.length };
  } catch (error: any) {
    console.error('Exception inspecting help requests:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const createTestHelpRequest = async () => {
  const testRequest = {
    title: 'Test Help Request',
    description: 'This is a test help request created for debugging purposes.',
    technical_area: ['Frontend', 'Backend'],
    urgency: 'medium',
    communication_preference: ['Chat', 'Video Call'],
    estimated_duration: 60,
    budget_range: '$50 - $100',
    status: 'pending' as HelpRequestStatus,
    client_id: 'test-client-id',
    code_snippet: 'console.log("This is a test code snippet");'
  };

  return await createHelpRequest(testRequest);
};
