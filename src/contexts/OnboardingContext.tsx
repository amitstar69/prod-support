
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useAuth } from '../contexts/auth';
import { updateUserData, invalidateUserDataCache } from '../contexts/auth/userDataFetching';

// Define types for onboarding state
interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  stepData: Record<number, any>;
}

// Define types for context value
interface OnboardingContextType {
  state: OnboardingState;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  setStepData: (step: number, data: any) => void;
  completeOnboarding: () => Promise<void>;
  saveProgress: (data: any) => Promise<void>;
}

// Create context with default values
const OnboardingContext = createContext<OnboardingContextType>({
  state: {
    currentStep: 1,
    totalSteps: 5,
    isCompleted: false,
    stepData: {}
  },
  goToNextStep: () => {},
  goToPreviousStep: () => {},
  goToStep: () => {},
  setStepData: () => {},
  completeOnboarding: async () => {},
  saveProgress: async () => {}
});

// Hook to use the onboarding context
export const useOnboarding = () => useContext(OnboardingContext);

// Provider component
export const OnboardingProvider: React.FC<{
  children: ReactNode;
  totalSteps: number;
  userType: 'client' | 'developer';
}> = ({ children, totalSteps, userType }) => {
  const { authState } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    totalSteps,
    isCompleted: false,
    stepData: {}
  });

  // Navigation functions
  const goToNextStep = () => {
    if (state.currentStep < totalSteps) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    }
  };

  const goToPreviousStep = () => {
    if (state.currentStep > 1) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setState(prev => ({
        ...prev,
        currentStep: step
      }));
    }
  };

  const setStepData = (step: number, data: any) => {
    setState(prev => ({
      ...prev,
      stepData: {
        ...prev.stepData,
        [step]: data
      }
    }));
  };

  // Complete the onboarding process
  const completeOnboarding = async () => {
    if (authState.userId) {
      try {
        // Mark onboarding as completed
        const userData = {
          profileCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
          profileCompletionPercentage: 100
        };
        
        await updateUserData(authState.userId, userData);
        invalidateUserDataCache(authState.userId);
        
        setState(prev => ({
          ...prev,
          isCompleted: true
        }));
      } catch (error) {
        console.error('Error completing onboarding:', error);
      }
    }
  };

  // Save progress during onboarding
  const saveProgress = async (data: any) => {
    if (authState.userId) {
      try {
        // Calculate completion percentage based on current step
        const completionPercentage = Math.round((state.currentStep / totalSteps) * 100);
        
        const userData = {
          ...data,
          profileCompletionPercentage: completionPercentage
        };
        
        await updateUserData(authState.userId, userData);
        invalidateUserDataCache(authState.userId);
      } catch (error) {
        console.error('Error saving onboarding progress:', error);
      }
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        setStepData,
        completeOnboarding,
        saveProgress
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
