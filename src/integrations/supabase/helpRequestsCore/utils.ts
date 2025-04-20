import { supabase } from '../client';
import { HelpRequest } from '../../../types/helpRequest';

// Utility functions for help request operations
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isLocalId = (id: string): boolean => {
  return id.startsWith('client-');
};

// Helper function to get help request from local storage
export const getLocalHelpRequests = (): HelpRequest[] => {
  try {
    return JSON.parse(localStorage.getItem('helpRequests') || '[]');
  } catch (error) {
    console.error('Error parsing local help requests:', error);
    return [];
  }
};

// Helper function to save help request to local storage
export const saveLocalHelpRequests = (helpRequests: HelpRequest[]): void => {
  localStorage.setItem('helpRequests', JSON.stringify(helpRequests));
};

// Generic error response handler
export const handleError = (error: any, customMessage: string = 'Unknown error'): { 
  success: false, 
  error: string 
} => {
  console.error(customMessage, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : customMessage 
  };
};

/**
 * Checks if a help request exists in Supabase regardless of RLS
 * This is used for debugging purposes
 */
export const checkHelpRequestExists = async (requestId: string) => {
  try {
    const { data, error } = await supabase.rpc('check_help_request_exists', { 
      request_id: requestId 
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error checking if help request exists:', error);
    return { data: false, error };
  }
};
