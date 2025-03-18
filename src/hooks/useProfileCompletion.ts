
import { useState, useEffect } from 'react';
import { Client } from '../types/product';
import { getCurrentUserData } from '../contexts/auth';
import { toast } from 'sonner';

export const useProfileCompletion = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const userData = await getCurrentUserData();
        
        if (userData && 'lookingFor' in userData) { // Check if it's a client
          setClient(userData as Client);
          
          // Calculate completion percentage
          setProfileCompletionPercentage(userData.profileCompletionPercentage || 0);
          
          console.log('Client data loaded:', userData);
        } else {
          console.error('User data is not a client or not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Could not load your profile information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  return {
    client,
    isLoading,
    profileCompletionPercentage,
    isProfileComplete: profileCompletionPercentage === 100
  };
};
