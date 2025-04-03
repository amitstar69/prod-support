
import { useState, useCallback } from 'react';
import { useAuth, updateUserData, invalidateUserDataCache } from '../../contexts/auth';
import { Client } from '../../types/product';
import { toast } from 'sonner';
import { ClientProfileFormData } from './useClientProfileForm';
import { calculateProfileCompletionPercentage } from './useProfileCompletion';

export const useProfileUpdates = (client: Client | null, formData: ClientProfileFormData) => {
  const { userId } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpdate = async (imageUrl: string) => {
    if (!userId) {
      toast.error("User ID not found. Please try logging in again.");
      return;
    }
    
    setIsSaving(true);
    console.log('Saving profile image update for user:', userId);
    console.log('New image URL:', imageUrl);
    
    try {
      const updatedData: Partial<Client> = {
        image: imageUrl
      };
      
      const success = await updateUserData(updatedData);
      
      if (success) {
        console.log('Profile image update successful');
        toast.success('Profile image updated successfully');
        invalidateUserDataCache(userId);
      } else {
        toast.error('Failed to update profile image. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error('An error occurred while updating your profile image');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveChanges = useCallback(async () => {
    if (!userId) {
      toast.error("User ID not found. Please try logging in again.");
      return;
    }
    
    setIsSaving(true);
    console.log('Saving client profile changes for user:', userId);
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      console.log(`Updating client name from "${client?.name}" to "${fullName}"`);
      
      const completionPercentage = calculateProfileCompletionPercentage(formData);
      console.log(`Calculated profile completion percentage: ${completionPercentage}%`);
      
      const isProfileComplete = completionPercentage >= 80;
      console.log(`Profile will be marked as complete: ${isProfileComplete} (${completionPercentage}% >= 80%)`);
      
      const updatedData: Partial<Client> = {
        name: fullName,
        email: formData.email,
        location: formData.location,
        description: formData.description,
        username: formData.username,
        bio: formData.bio,
        company: formData.company,
        position: formData.position,
        techStack: formData.techStack,
        industry: formData.industry,
        projectTypes: formData.projectTypes,
        preferredHelpFormat: formData.preferredHelpFormat,
        budgetPerHour: formData.budgetPerHour,
        paymentMethod: formData.paymentMethod,
        profileCompleted: isProfileComplete,
        profileCompletionPercentage: completionPercentage
      };
      
      console.log("Submitting client profile update:", updatedData);
      
      const success = await updateUserData(updatedData);
      
      if (success) {
        console.log('Profile update successful, forcing data refresh');
        
        invalidateUserDataCache(userId);
        
        // Add a small delay before showing success message
        await new Promise(resolve => setTimeout(resolve, 300));
        
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile. Please verify your connection and try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  }, [client, formData, userId]);

  return { 
    isSaving, 
    handleSaveChanges, 
    handleImageUpdate 
  };
};
