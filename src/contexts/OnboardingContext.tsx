
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getCurrentUserData, updateUserData } from './auth';
import { toast } from 'sonner';

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: () => Promise<boolean>;
  skipOnboarding: () => void;
  isOnboardingComplete: boolean;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
  userType: 'client' | 'developer';
  totalSteps: number;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ 
  children, 
  userType,
  totalSteps
}) => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setIsLoading(true);
      try {
        const userData = await getCurrentUserData();
        if (userData) {
          setIsOnboardingComplete(!!userData.profileCompleted);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      checkOnboardingStatus();
    } else {
      setIsLoading(false);
    }
  }, [userId]);
  
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };
  
  const completeOnboarding = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await updateUserData({
        profileCompleted: true,
        profileCompletionPercentage: 100,
        onboardingCompletedAt: new Date().toISOString()
      });
      
      if (success) {
        setIsOnboardingComplete(true);
        toast.success('Onboarding completed successfully!');
        
        // Redirect based on user type
        if (userType === 'client') {
          navigate('/client-dashboard');
        } else {
          navigate('/developer-dashboard');
        }
        
        return true;
      } else {
        toast.error('Failed to complete onboarding. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('An error occurred while completing onboarding');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const skipOnboarding = () => {
    toast.info('You can complete your profile later from your settings');
    if (userType === 'client') {
      navigate('/client-dashboard');
    } else {
      navigate('/developer-dashboard');
    }
  };
  
  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        totalSteps,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        completeOnboarding,
        skipOnboarding,
        isOnboardingComplete,
        isLoading
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
