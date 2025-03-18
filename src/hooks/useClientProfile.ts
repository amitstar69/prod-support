
import { useState, useEffect } from 'react';
import { useAuth, getCurrentUserData, updateUserData } from '../contexts/auth';
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
  
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      
      const timeoutId = setTimeout(() => {
        console.log('Profile loading timeout reached');
        setLoadingTimeoutReached(true);
        setIsLoading(false);
        toast.error("Loading profile data is taking longer than expected. You can try logging out and back in.");
      }, 10000);
      
      try {
        const userData = await getCurrentUserData();
        
        clearTimeout(timeoutId);
        
        if (userData) {
          const clientData = userData as Client;
          setClient(clientData);
          
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
    };
    
    if (userId) {
      fetchUser();
    } else {
      setIsLoading(false);
      toast.error("User ID not found. Please try logging in again.");
    }
  }, [userId]);
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      const updatedData: Partial<Client> = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
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
        const userData = await getCurrentUserData();
        if (userData) {
          setClient(userData as Client);
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
  
  return {
    client,
    formData,
    isLoading,
    isSaving,
    loadingTimeoutReached,
    handleInputChange,
    handleSaveChanges
  };
};
