import { HelpRequest, HelpRequestMatch } from '../../types/helpRequest';
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
      return null;
    }

    toast.success('Help request created successfully');
    return data;
  } catch (error) {
    console.error('Exception creating help request:', error);
    toast.error('An unexpected error occurred');
    return null;
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

    return data || [];
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

    return data;
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
    return data;
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
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
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
