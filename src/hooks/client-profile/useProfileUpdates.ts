import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/auth';
import { Client } from '../../types/product';
import { updateUserData } from '../../contexts/auth/userDataUpdates';
import { toast } from 'sonner';
import { invalidateUserDataCache } from '../../contexts/auth/authUserDataCache';

export const useProfileUpdates = () => {
  const { authState } = useAuth();
  const [currentProfile, setCurrentProfile] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authState.userType === 'client' && authState.userId) {
      // You might want to fetch the profile data here if needed
      // and set it to currentProfile state
    }
  }, [authState.userType, authState.userId]);

  const currentUserId = authState.userId;

  // Fix updateUserProfile function to accept userData as parameter
  export const updateUserProfile = async (userData: Partial<Client>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!currentUserId) {
        setError('User not authenticated.');
        return;
      }

      const success = await updateUserData({ id: currentUserId, ...userData });

      if (success) {
        toast.success('Profile updated successfully!');
        setCurrentProfile(prevProfile => ({ ...prevProfile, ...userData } as Client));
      } else {
        setError('Failed to update profile.');
        toast.error('Failed to update profile.');
      }
      
      // Fix invalidateUserDataCache call by passing userId
      if (currentProfile && currentProfile.id) {
        invalidateUserDataCache(currentProfile.id);
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred.');
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fix updateProfileSection function to accept section and data parameters
  export const updateProfileSection = async (section: string, data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!currentUserId) {
        setError('User not authenticated.');
        return;
      }

      const userData = { [section]: data };
      const success = await updateUserData({ id: currentUserId, ...userData });

      if (success) {
        toast.success(`${section} updated successfully!`);
        setCurrentProfile(prevProfile => ({ ...prevProfile, ...userData } as Client));
      } else {
        setError(`Failed to update ${section}.`);
        toast.error(`Failed to update ${section}.`);
      }
      
      // Fix invalidateUserDataCache call by passing userId
      if (currentProfile && currentProfile.id) {
        invalidateUserDataCache(currentProfile.id);
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred.');
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentProfile,
    isLoading,
    error,
    updateUserProfile,
    updateProfileSection,
  };
};
