
import { useClientProfileData } from './useClientProfileData';
import { useClientProfileForm } from './useClientProfileForm';
import { useProfileUpdates } from './useProfileUpdates';
import { useProfileCompletion } from './useProfileCompletion';

export const useClientProfile = () => {
  const { client, isLoading, loadingTimeoutReached, refreshProfile } = useClientProfileData();
  const { formData, handleInputChange } = useClientProfileForm(client);
  const { isSaving, handleSaveChanges, handleImageUpdate } = useProfileUpdates(client, formData);
  const { calculateProfileCompletionPercentage } = useProfileCompletion();

  // Calculate profile completion if not already provided
  if (client && !client.profileCompletionPercentage) {
    client.profileCompletionPercentage = calculateProfileCompletionPercentage(formData);
  }

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
    refreshProfile
  };
};
