
import { useClientProfileData } from './useClientProfileData';
import { useClientProfileForm } from './useClientProfileForm';
import { useProfileUpdates } from './useProfileUpdates';
import { useProfileCompletion, calculateProfileCompletionPercentage } from './useProfileCompletion';

export const useClientProfile = () => {
  const { client, isLoading, loadingTimeoutReached, refreshProfile } = useClientProfileData();
  const { formData, handleInputChange } = useClientProfileForm(client);
  const { isUpdating: isSaving, updateProfile } = useProfileUpdates(client);
  
  // Calculate profile completion if not already provided
  if (client && !client.profileCompletionPercentage) {
    client.profileCompletionPercentage = calculateProfileCompletionPercentage(formData);
  }
  
  const handleSaveChanges = () => {
    return updateProfile(formData);
  };

  const handleImageUpdate = (value: string) => {
    if (client) {
      updateProfile({ ...client, image: value });
    }
  };

  // Handle image update through input change
  const handleFormInputChange = (field: string, value: any) => {
    handleInputChange(field, value);
    
    if (field === 'image') {
      handleImageUpdate(value);
    }
  };

  return {
    client,
    formData,
    isLoading,
    isSaving,
    loadingTimeoutReached,
    handleInputChange: handleFormInputChange,
    handleSaveChanges,
    refreshProfile,
    handleImageUpdate
  };
};
