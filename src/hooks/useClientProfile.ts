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
  image?: string;
}

const calculateProfileCompletionPercentage = (formData: ClientProfileFormData): number => {
  const requiredFields: (keyof ClientProfileFormData)[] = [
    'firstName', 'lastName', 'email', 'username', 'location'
  ];
  
  const optionalFields: (keyof ClientProfileFormData)[] = [
    'bio', 'company', 'position', 'techStack', 'industry', 
    'description', 'projectTypes', 'preferredHelpFormat', 
    'budgetPerHour', 'paymentMethod'
  ];
  
  let completedRequiredFields = 0;
  for (const field of requiredFields) {
    const value = formData[field];
    if ((typeof value === 'string' && value.trim() !== '') || 
        (Array.isArray(value) && value.length > 0)) {
      completedRequiredFields++;
    }
  }
  
  let completedOptionalFields = 0;
  for (const field of optionalFields) {
    const value = formData[field];
    if ((typeof value === 'string' && value.trim() !== '') || 
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === 'number' && value > 0)) {
      completedOptionalFields++;
    }
  }
  
  const requiredPercentage = (completedRequiredFields / requiredFields.length) * 60;
  const optionalPercentage = (completedOptionalFields / optionalFields.length) * 40;
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
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetryCount] = useState(3); // Maximum number of retries
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
    paymentMethod: 'Stripe',
    image: ''
  });
  
  const fetchUserData = useCallback(async (forceRefresh = true) => {
    if (!userId) return;
    
    setIsLoading(true);
    setLoadingTimeoutReached(false);
    console.log('Fetching client profile data for user:', userId, 'forceRefresh:', forceRefresh, 'retry:', retryCount);
    
    // Set a loading timeout - make it shorter on retries
    const timeoutDuration = retryCount > 0 ? 15000 : 30000; // Increased timeouts (15s for retries, 30s initially)
    const timeoutId = setTimeout(() => {
      console.log('Profile loading timeout reached after', timeoutDuration/1000, 'seconds');
      setLoadingTimeoutReached(true);
      setIsLoading(false);
      
      // Only show toast on first timeout
      if (retryCount === 0) {
        toast.error("Loading profile data is taking longer than expected. You can try refreshing or logging out and back in.");
      }
    }, timeoutDuration);
    
    try {
      if (forceRefresh) {
        console.log('Forcing cache invalidation before fetch');
        invalidateUserDataCache(userId);
        // Add a small delay after cache invalidation to ensure it's processed
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log('Fetching fresh user data');
      const userData = await getCurrentUserData();
      
      clearTimeout(timeoutId);
      
      if (userData) {
        // Check if this is a client data using properties specific to the Client type
        if (!('budgetPerHour' in userData) && !('projectTypes' in userData)) {
          console.error('User data is not client data:', userData);
          toast.error("Retrieved user data is not client data. This may indicate an issue with your account type.");
          setIsLoading(false);
          return;
        }
        
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
          paymentMethod: (clientData.paymentMethod || 'Stripe') as 'Stripe' | 'PayPal',
          image: clientData.image || ''
        };
        
        setFormData(newFormData);
        
        console.log('Existing profile completion data:', {
          profileCompleted: clientData.profileCompleted,
          percentage: clientData.profileCompletionPercentage
        });
        
        // Reset retry count on successful fetch
        setRetryCount(0);
        setIsLoading(false);
      } else {
        console.error("User data not found");
        
        // Increment retry count for next attempt
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        
        if (nextRetryCount <= maxRetryCount) {
          console.log(`Auto-retrying fetch (${nextRetryCount}/${maxRetryCount}) after delay...`);
          
          // Exponential backoff for retries (2s, 4s, 8s)
          const retryDelay = Math.min(2000 * Math.pow(2, retryCount), 8000);
          
          setTimeout(() => {
            toast.info(`Retry ${nextRetryCount}/${maxRetryCount}: Attempting to load profile data again...`);
            fetchUserData(true);
          }, retryDelay);
        } else {
          toast.error("Failed to load profile after multiple attempts. Please try refreshing the page.");
          setLoadingTimeoutReached(true);
          setIsLoading(false);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error("Error fetching user data:", error);
      
      // Increment retry count
      const nextRetryCount = retryCount + 1;
      setRetryCount(nextRetryCount);
      
      if (nextRetryCount <= maxRetryCount) {
        console.log(`Error retry (${nextRetryCount}/${maxRetryCount}) after delay...`);
        
        // Exponential backoff for retries
        const retryDelay = Math.min(2000 * Math.pow(2, retryCount), 8000);
        
        toast.error(`Error loading profile. Retrying (${nextRetryCount}/${maxRetryCount})...`);
        setTimeout(() => {
          fetchUserData(true);
        }, retryDelay);
      } else {
        toast.error("Failed to load profile after multiple attempts. Please try refreshing the page.");
        setLoadingTimeoutReached(true);
        setIsLoading(false);
      }
    }
  }, [userId, retryCount, maxRetryCount]);
  
  useEffect(() => {
    if (userId) {
      console.log('Initial client profile data fetch for user:', userId);
      // Reset retry count when component mounts
      setRetryCount(0);
      fetchUserData(true);
    } else {
      setIsLoading(false);
    }
    
    // Clean up function to clear any pending timeouts when component unmounts
    return () => {
      console.log('useClientProfile hook cleaning up');
    };
  }, [userId, fetchUserData]);
  
  const handleInputChange = (field: string, value: any) => {
    console.log('Input changed:', field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'image') {
      handleImageUpdate(value);
    }
  };
  
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
      
      if (client) {
        setClient({
          ...client,
          image: imageUrl
        });
      }
      
      const success = await updateUserData(updatedData);
      
      if (success) {
        console.log('Profile image update successful');
        toast.success('Profile image updated successfully');
        invalidateUserDataCache(userId);
      } else {
        toast.error('Failed to update profile image. Please try again.');
        await fetchUserData(true);
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error('An error occurred while updating your profile image');
      await fetchUserData(true);
    } finally {
      setIsSaving(false);
    }
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
        
        invalidateUserDataCache(userId);
        
        // Add a small delay before fetching fresh data
        await new Promise(resolve => setTimeout(resolve, 300));
        await fetchUserData(true);
        
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile. Please verify your connection and try again.');
        await fetchUserData(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
      await fetchUserData(true);
    } finally {
      setIsSaving(false);
    }
  };
  
  const refreshProfile = useCallback(() => {
    if (userId) {
      console.log('Manual profile refresh requested for user:', userId);
      // Reset retry count when manually refreshing
      setRetryCount(0);
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
