
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
  
  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    console.log('Fetching client profile data for user:', userId);
    
    const timeoutId = setTimeout(() => {
      console.log('Profile loading timeout reached');
      setLoadingTimeoutReached(true);
      setIsLoading(false);
      toast.error("Loading profile data is taking longer than expected. You can try logging out and back in.");
    }, 10000);
    
    try {
      // Always force a fresh fetch when explicitly calling fetchUserData
      invalidateUserDataCache(userId);
      console.log('Fetching fresh user data after cache invalidation');
      const userData = await getCurrentUserData();
      
      clearTimeout(timeoutId);
      
      if (userData) {
        const clientData = userData as Client;
        setClient(clientData);
        console.log('Client data fetched successfully:', clientData);
        
        const nameParts = clientData.name ? clientData.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setFormData({
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
        });
        console.log('Form data populated:', formData);
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
      fetchUserData();
    } else {
      setIsLoading(false);
      toast.error("User ID not found. Please try logging in again.");
    }
  }, [userId, fetchUserData]);
  
  const handleInputChange = (field: string, value: any) => {
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
        profileCompleted: true,
        profileCompletionPercentage: 100
      };
      
      console.log("Submitting client profile update:", updatedData);
      
      const success = await updateUserData(updatedData);
      
      if (success) {
        console.log('Profile update successful, forcing data refresh');
        
        // Force a refresh of the cache for this user
        invalidateUserDataCache(userId);
        
        // Fetch fresh data immediately
        console.log('Fetching latest data after successful update');
        const userData = await getCurrentUserData();
        if (userData) {
          setClient(userData as Client);
          console.log("Updated client data:", userData);
          
          // Update the form data with the fresh data to ensure consistency
          const nameParts = userData.name ? userData.name.split(' ') : ['', ''];
          setFormData(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: userData.email || prev.email,
            location: userData.location || prev.location,
            description: userData.description || prev.description,
            username: userData.username || prev.username,
            bio: 'bio' in userData ? userData.bio || prev.bio : prev.bio,
            company: 'company' in userData ? userData.company || prev.company : prev.company,
            position: 'position' in userData ? userData.position || prev.position : prev.position,
            techStack: 'techStack' in userData ? userData.techStack || prev.techStack : prev.techStack,
            industry: 'industry' in userData ? userData.industry || prev.industry : prev.industry,
            projectTypes: 'projectTypes' in userData ? userData.projectTypes || prev.projectTypes : prev.projectTypes,
            preferredHelpFormat: 'preferredHelpFormat' in userData ? userData.preferredHelpFormat || prev.preferredHelpFormat : prev.preferredHelpFormat,
            budgetPerHour: 'budgetPerHour' in userData ? userData.budgetPerHour || prev.budgetPerHour : prev.budgetPerHour,
            paymentMethod: 'paymentMethod' in userData ? (userData.paymentMethod as 'Stripe' | 'PayPal') || prev.paymentMethod : prev.paymentMethod
          }));
          console.log('Form data updated with fresh data');
        }
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const refreshProfile = useCallback(() => {
    if (userId) {
      console.log('Manual profile refresh requested for user:', userId);
      invalidateUserDataCache(userId);
      fetchUserData();
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
