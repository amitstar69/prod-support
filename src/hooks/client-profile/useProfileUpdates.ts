
import { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { useProfileCompletion } from './useProfileCompletion';
import { Client } from '../../types/product';
import { useAuth } from '../../contexts/auth';

export const useProfileUpdates = (profileData: Partial<Client> | null) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { userId } = useAuth();
  const { completionPercentage } = useProfileCompletion(profileData);
  
  const updateProfile = async (updatedData: Partial<Client>): Promise<boolean> => {
    if (!userId) {
      toast.error('User ID is missing. Please log in again.');
      return false;
    }
    
    setIsUpdating(true);
    
    try {
      // First update the profiles table with basic info
      const basicInfo: Record<string, any> = {};
      
      if (updatedData.name) basicInfo.name = updatedData.name;
      if (updatedData.image) basicInfo.image = updatedData.image;
      if (updatedData.location) basicInfo.location = updatedData.location;
      if (updatedData.description) basicInfo.description = updatedData.description;
      if (updatedData.languages) basicInfo.languages = updatedData.languages;
      if (updatedData.preferredWorkingHours) basicInfo.preferred_working_hours = updatedData.preferredWorkingHours;
      if (updatedData.username) basicInfo.username = updatedData.username;
      
      // Only update profiles if we have data to update
      if (Object.keys(basicInfo).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(basicInfo)
          .eq('id', userId);
          
        if (profileError) {
          console.error('Error updating basic profile:', profileError);
          toast.error('Error updating profile: ' + profileError.message);
          return false;
        }
      }
      
      // Now update client_profiles table with client-specific data
      const clientData: Record<string, any> = {};
      
      if (updatedData.lookingFor) clientData.looking_for = updatedData.lookingFor;
      if (updatedData.preferredHelpFormat) clientData.preferred_help_format = updatedData.preferredHelpFormat;
      if (updatedData.techStack) clientData.tech_stack = updatedData.techStack;
      if (updatedData.budget) clientData.budget = updatedData.budget;
      if (updatedData.budgetPerHour) clientData.budget_per_hour = updatedData.budgetPerHour;
      if (updatedData.paymentMethod) clientData.payment_method = updatedData.paymentMethod;
      if (updatedData.bio) clientData.bio = updatedData.bio;
      if (updatedData.company) clientData.company = updatedData.company;
      if (updatedData.position) clientData.position = updatedData.position;
      if (updatedData.projectTypes) clientData.project_types = updatedData.projectTypes;
      if (updatedData.industry) clientData.industry = updatedData.industry;
      if (updatedData.communicationPreferences) clientData.communication_preferences = updatedData.communicationPreferences;
      
      // Always update the completion percentage
      clientData.profile_completion_percentage = completionPercentage;
      
      // Update the client_profiles table
      const { error: clientProfileError } = await supabase
        .from('client_profiles')
        .update(clientData)
        .eq('id', userId);
        
      if (clientProfileError) {
        console.error('Error updating client profile:', clientProfileError);
        toast.error('Error updating profile: ' + clientProfileError.message);
        return false;
      }
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error in profile update:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    updateProfile,
    isUpdating,
    completionPercentage
  };
};
