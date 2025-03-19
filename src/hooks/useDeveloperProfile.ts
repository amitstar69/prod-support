
import { useState, useEffect, useCallback } from 'react';
import { useAuth, getCurrentUserData, updateUserData, invalidateUserDataCache } from '../contexts/auth';
import { Developer } from '../types/product';
import { toast } from 'sonner';

interface DeveloperProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  category: string;
  skills: string[];
  experience: string;
  hourlyRate: number;
  minuteRate: number;
  availability: boolean;
  description: string;
  communicationPreferences: string[];
  username: string;
  bio: string;
}

export const useDeveloperProfile = () => {
  const { userId } = useAuth();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
  const [formData, setFormData] = useState<DeveloperProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    category: 'frontend',
    skills: [],
    experience: '',
    hourlyRate: 75,
    minuteRate: 1.25,
    availability: true,
    description: '',
    communicationPreferences: ['video', 'chat', 'voice'],
    username: '',
    bio: ''
  });
  
  const fetchUserData = useCallback(async (forceRefresh = true) => {
    if (!userId) return;
    
    setIsLoading(true);
    console.log('Fetching developer profile data for user:', userId, 'forceRefresh:', forceRefresh);
    
    const timeoutId = setTimeout(() => {
      console.log('Profile loading timeout reached');
      setLoadingTimeoutReached(true);
      setIsLoading(false);
      toast.error("Loading profile data is taking longer than expected. You can try logging out and back in.");
    }, 10000); // 10 seconds timeout
    
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
        const developerData = userData as Developer;
        setDeveloper(developerData);
        console.log('Developer data fetched successfully:', developerData);
        
        const nameParts = developerData.name ? developerData.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setFormData({
          firstName,
          lastName,
          email: developerData.email || '',
          phone: developerData.phone || '',
          location: developerData.location || '',
          category: developerData.category || 'frontend',
          skills: developerData.skills || [],
          experience: developerData.experience || '',
          hourlyRate: developerData.hourlyRate || 75,
          minuteRate: developerData.minuteRate || 1.25,
          availability: typeof developerData.availability === 'boolean' ? developerData.availability : true,
          description: developerData.description || '',
          communicationPreferences: (developerData.communicationPreferences || ['video', 'chat', 'voice']) as string[],
          username: developerData.username || '',
          bio: developerData.bio || ''
        });
        console.log('Form data populated:', { firstName, lastName, email: developerData.email });
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
      console.log('Initial developer profile data fetch for user:', userId);
      fetchUserData(false); // Initial load, don't force refresh
    } else {
      setIsLoading(false);
      toast.error("User ID not found. Please try logging in again.");
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
    console.log('Saving developer profile changes for user:', userId);
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      console.log(`Updating developer name from "${developer?.name}" to "${fullName}"`);
      
      const updatedData: Partial<Developer> = {
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        category: formData.category,
        skills: formData.skills,
        experience: formData.experience,
        hourlyRate: formData.hourlyRate,
        minuteRate: formData.minuteRate,
        availability: formData.availability,
        description: formData.description,
        communicationPreferences: formData.communicationPreferences,
        username: formData.username,
        bio: formData.bio,
        profileCompleted: true,
        profileCompletionPercentage: 100
      };
      
      console.log("Submitting developer profile update:", updatedData);
      
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
      fetchUserData(true);
    }
  }, [userId, fetchUserData]);
  
  return {
    developer,
    formData,
    isLoading,
    isSaving,
    loadingTimeoutReached,
    handleInputChange,
    handleSaveChanges,
    refreshProfile
  };
};
