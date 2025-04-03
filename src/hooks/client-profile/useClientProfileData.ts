import { useState, useEffect, useCallback } from 'react';
import { Client } from '../../types/product';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/auth';
import { toast } from 'sonner';
import { invalidateUserDataCache } from '../../contexts/auth/authUserDataCache';

// Define a type for the state
interface ClientProfileState {
  profile: Client | null;
  loading: boolean;
  error: string | null;
}

// Custom hook for fetching and managing client profile data
export const useClientProfileData = () => {
  const { authState } = useAuth();
  const [state, setState] = useState<ClientProfileState>({
    profile: null,
    loading: true,
    error: null,
  });

  // Store the current user ID in a variable
  const currentUserId = authState.userId;

  // Function to fetch client profile data
  // Update this function to accept the userId parameter
  export const fetchClientProfile = async (userId: string) => {
    try {
      setState(prevState => ({ ...prevState, loading: true, error: null }));

      if (!userId) {
        throw new Error('User ID is required to fetch client profile');
      }

      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(`Error fetching client profile: ${error.message}`);
      }

      if (!data) {
        throw new Error('Client profile not found');
      }

      // Fetch the corresponding profile data from the "profiles" table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error(`Error fetching profile data: ${profileError.message}`);
      }

      if (!profileData) {
        throw new Error('Profile data not found');
      }

      // Combine the data from both tables
      const combinedData = { ...profileData, ...data };

      setState({
        profile: combinedData as Client,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        profile: null,
        loading: false,
        error: error.message,
      });
      toast.error(error.message);
    }
  };

  // Add userId parameter to invalidateUserDataCache calls
  export const invalidateClientProfileCache = () => {
    if (currentUserId) {
      invalidateUserDataCache(currentUserId);
    }
  };

  // Fetch client profile data when the component mounts or when the user ID changes
  useEffect(() => {
    if (currentUserId) {
      fetchClientProfile(currentUserId);
    } else {
      setState({
        profile: null,
        loading: false,
        error: 'User not authenticated',
      });
    }
  }, [currentUserId]);

  return {
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    fetchClientProfile,
    invalidateClientProfileCache,
  };
};
