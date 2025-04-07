
import { useState, useEffect, useMemo } from 'react';

interface ProfileData {
  name?: string;
  email?: string;
  image?: string;
  location?: string;
  description?: string;
  lookingFor?: string[];
  techStack?: string[];
  preferredHelpFormat?: string[];
  budget?: number;
  budgetPerHour?: number;
  paymentMethod?: string;
  company?: string;
  position?: string;
  projectTypes?: string[];
  industry?: string;
  [key: string]: any;
}

export const useProfileCompletion = (profileData: ProfileData | null) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const fieldWeights = {
    // Basic info (40%)
    name: 10,
    email: 5,
    image: 5,
    location: 5,
    description: 15,
    
    // Preferences (30%)
    lookingFor: 10,
    techStack: 10,
    preferredHelpFormat: 5,
    communicationPreferences: 5,
    
    // Payment info (20%)
    budget: 5,
    budgetPerHour: 5,
    paymentMethod: 10,
    
    // Professional info (10%)
    company: 2,
    position: 2,
    projectTypes: 3,
    industry: 3,
  };

  const calculateCompletion = useMemo(() => {
    if (!profileData) return 0;
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    Object.entries(fieldWeights).forEach(([field, weight]) => {
      maxPossibleScore += weight;
      
      const value = profileData[field];
      if (value) {
        if (Array.isArray(value) && value.length > 0) {
          // For array fields, give partial credit based on how many items are added
          // But at least 1 item gives 50% of the weight
          totalScore += weight * Math.min(1, (0.5 + (value.length * 0.1)));
        } else if (typeof value === 'string' && value.trim() !== '') {
          totalScore += weight;
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          totalScore += weight;
        } else if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
          totalScore += weight;
        }
      }
    });
    
    return Math.round((totalScore / maxPossibleScore) * 100);
  }, [profileData]);
  
  useEffect(() => {
    setCompletionPercentage(calculateCompletion);
  }, [calculateCompletion]);
  
  return {
    completionPercentage,
    isComplete: completionPercentage >= 80
  };
};
