
import { useState, useEffect, useCallback } from 'react';
import { useAuth, getCurrentUserData, updateUserData, invalidateUserDataCache } from '../contexts/auth';
import { Client } from '../types/product';
import { toast } from 'sonner';

interface ClientProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  description: string;
  username: string;
  bio: string;
  company: string;
  position: string;
  techStack: string[];
  industry: string;
  projectTypes: string[];
  preferredHelpFormat: string[];
  budgetPerHour: number;
  paymentMethod: 'Stripe' | 'PayPal';
}

// Function to calculate profile completion percentage based on filled fields
const calculateProfileCompletionPercentage = (formData: ClientProfileFormData): number => {
  // Define required and optional fields for profile completion
  const requiredFields: (keyof ClientProfileFormData)[] = [
    'firstName', 'lastName', 'email', 'username', 'location'
  ];
  
  const optionalFields: (keyof ClientProfileFormData)[] = [
    'bio', 'company', 'position', 'techStack', 'industry', 
    'description', 'projectTypes', 'preferredHelpFormat', 
    'budgetPerHour', 'paymentMethod'
  ];
  
  // Count completed required fields
  let completedRequiredFields = 0;
  for (const field of requiredFields) {
    const value = formData[field];
    if ((typeof value === 'string' && value.trim() !== '') || 
        (Array.isArray(value) && value.length > 0)) {
      completedRequiredFields++;
    }
  }
  
  // Count completed optional fields
  let completedOptionalFields = 0;
  for (const field of optionalFields) {
    const value = formData[field];
    if ((typeof value === 'string' && value.trim() !== '') || 
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === 'number' && value > 0)) {
      completedOptionalFields++;
    }
  }
  
  // Calculate percentage - required fields are worth 70% of total, optional fields 30%
  const requiredPercentage = (completedRequiredFields / requiredFields.length) * 70;
  const optionalPercentage = (completedOptionalFields / optionalFields.length) * 30;
  const totalPercentage = Math.round(requiredPercentage + optionalPercentage);
  
  console.log(`Profile completion calculation:`, {
    required: `${completedRequiredFields}/${requiredFields.length} (${requiredPercentage.toFixed(1)}%)`,
    optional: `${completedOptionalFields}/${optionalFields.length} (${optionalPercentage.toFixed(1)}%)`,
    total: `${totalPercentage}%`
  });
  
  return totalPercentage;
};

export const useClientProfile = () => {
  const { userId } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
  const [formData, setFormData] = useState<ClientProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    description: '',
    username: '',
    bio: '',
    company: '',
    position: '',
    techStack: [],
    industry: '',
    projectTypes: [],
    preferredHelpFormat: [],
    budgetPerHour: 0,
    paymentMethod: 'Stripe'
  });
  
  const fetchUserData = useCallback(async (forceRefresh = true) => {
    if (!userId) return;
    
    setIsLoading(true);
    console.log('Fetching client profile data for user:', userId, 'forceRefresh:', forceRefresh);
    
    const timeoutId = setTimeout(() => {
      console.log('Profile loading timeout reached');
      setLoadingTimeoutReached(true);
      setIsLoading(false);
      toast.error("Loading profile data is taking longer than expected. You can try logging out and back in.");
    }, 10000);
    
    try {
      // Force a fresh fetch if requested
      if (forceRefresh) {
        console.log('Forcing cache invalidation before fetch');
        invalidateUserDataCache(userId);
      }
      
      console.log('Fetching fresh user data');
      const userData = await getCurrentUserData();
      
      clearTimeout(timeoutId);
      
      if (userData) {
        const clientData = userData as Client;
        console.log('Client data fetched successfully:', clientData);
        setClient(clientData);
        
        const nameParts = clientData.name ? clientData.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const newFormData = {
          firstName,
          lastName,
          email: clientData.email || '',
          location: clientData.location || '',
          description: clientData.description || '',
          username: clientData.username || '',
          bio: clientData.bio || '',
          company: clientData.company || '',
          position: clientData.position || '',
          techStack: clientData.techStack || [],
          industry: clientData.industry || '',
          projectTypes: clientData.projectTypes || [],
          preferredHelpFormat: (clientData.preferredHelpFormat || []) as string[],
          budgetPerHour: clientData.budgetPerHour || 0,
          paymentMethod: (clientData.paymentMethod || 'Stripe') as 'Stripe' | 'PayPal'
        };
        
        setFormData(newFormData);
        
        // Log existing profile completion data
        console.log('Existing profile completion data:', {
          profileCompleted: clientData.profileCompleted,
          percentage: clientData.profileCompletionPercentage
        });
        
        console.log('Form data populated:', { firstName, lastName, email: clientData.email });
      } else {
        toast.error("Failed to load profile data: User data not found");
        console.error("User data not found");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error("Error fetching user data:", error);
      toast.error("Failed to load profile data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    if (userId) {
      console.log('Initial client profile data fetch for user:', userId);
      fetchUserData(true); // Force a fresh fetch on initial load
    } else {
      setIsLoading(false);
    }
  }, [userId, fetchUserData]);
  
  const handleInputChange = (field: string, value: any) => {
    console.log('Input changed:', field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveChanges = async () => {
    if (!userId) {
      toast.error("User ID not found. Please try logging in again.");
      return;
    }
    
    setIsSaving(true);
    console.log('Saving client profile changes for user:', userId);
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      console.log(`Updating client name from "${client?.name}" to "${fullName}"`);
      
      // Calculate profile completion percentage
      const completionPercentage = calculateProfileCompletionPercentage(formData);
      console.log(`Calculated profile completion percentage: ${completionPercentage}%`);
      
      // Determine if profile should be marked as complete (if completion is >= 85%)
      const isProfileComplete = completionPercentage >= 85;
      console.log(`Profile will be marked as complete: ${isProfileComplete} (${completionPercentage}% >= 85%)`);
      
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
        // CRITICAL: These fields ensure profile completion is correctly tracked
        profileCompleted: isProfileComplete,
        profileCompletionPercentage: completionPercentage
      };
      
      console.log("Submitting client profile update:", updatedData);
      
      // First update the local state before the API call to ensure UI is responsive
      if (client) {
        const updatedClient = {
          ...client,
          ...updatedData
        };
        setClient(updatedClient);
      }
      
      const success = await updateUserData(updatedData);
      
      if (success) {
        console.log('Profile update successful, forcing data refresh');
        
        // Force a refresh of the cache for this user
        invalidateUserDataCache(userId);
        
        // Fetch fresh data immediately after a successful update
        console.log('Fetching latest data after successful update');
        await fetchUserData(true);
        
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile. Please verify your connection and try again.');
        // Revert client state to original if update failed
        await fetchUserData(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
      // Revert client state if there was an exception
      await fetchUserData(true);
    } finally {
      setIsSaving(false);
    }
  };
  
  const refreshProfile = useCallback(() => {
    if (userId) {
      console.log('Manual profile refresh requested for user:', userId);
      fetchUserData(true);
    }
  }, [userId, fetchUserData]);
  
  return {
    client,
    formData,
    isLoading,
    isSaving,
    loadingTimeoutReached,
    handleInputChange,
    handleSaveChanges,
    refreshProfile
  };
};
