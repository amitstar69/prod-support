
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import DeveloperSkillsStep from './steps/developer/DeveloperSkillsStep';
import DeveloperCategoryStep from './steps/developer/DeveloperCategoryStep';
import DeveloperExperienceStep from './steps/developer/DeveloperExperienceStep';
import DeveloperAvailabilityStep from './steps/developer/DeveloperAvailabilityStep';
import DeveloperBioStep from './steps/developer/DeveloperBioStep';
import { invalidateUserDataCache } from '../../contexts/auth/authUserDataCache';
import { toast } from 'sonner';

const DeveloperOnboardingContent = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { 
    state: onboardingState, 
    goToNextStep, 
    goToPreviousStep, 
    goToStep, 
    setStepData, 
    completeOnboarding 
  } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authState.userId) {
      invalidateUserDataCache(authState.userId);
    }
    
    // Redirect if not authenticated or wrong user type
    if (!authState.isAuthenticated || authState.userType !== 'developer') {
      navigate('/login');
    }
  }, [authState.isAuthenticated, authState.userType, authState.userId, navigate]);

  useEffect(() => {
    if (onboardingState.isCompleted) {
      toast.success('Onboarding completed! Redirecting to your profile...');
      setTimeout(() => {
        navigate('/developer-dashboard');
      }, 2000);
    }
  }, [onboardingState.isCompleted, navigate]);

  const renderStepContent = () => {
    switch (onboardingState.currentStep) {
      case 1:
        return <DeveloperSkillsStep />;
      case 2:
        return <DeveloperCategoryStep />;
      case 3:
        return <DeveloperExperienceStep />;
      case 4:
        return <DeveloperAvailabilityStep />;
      case 5:
        return <DeveloperBioStep />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <OnboardingLayout 
      title="Developer Profile Setup"
      subtitle="Complete your profile to start getting matched with clients"
      currentStep={onboardingState.currentStep}
      totalSteps={onboardingState.totalSteps}
      goToStep={goToStep}
      onNextStep={goToNextStep}
      onBackStep={onboardingState.currentStep > 1 ? goToPreviousStep : undefined}
      nextLabel={onboardingState.currentStep === onboardingState.totalSteps ? "Complete" : "Next"}
    >
      {renderStepContent()}
    </OnboardingLayout>
  );
};

const DeveloperOnboarding = () => {
  return (
    <OnboardingProvider totalSteps={5} userType="developer">
      <DeveloperOnboardingContent />
    </OnboardingProvider>
  );
};

export default DeveloperOnboarding;
