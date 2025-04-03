
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import ClientDetailsStep from './steps/client/ClientDetailsStep';
import ProjectDetailsStep from './steps/client/ProjectDetailsStep';
import BudgetStep from './steps/client/BudgetStep';
import ReviewAndSubmitStep from './steps/client/ReviewAndSubmitStep';
import { toast } from 'sonner';
import { invalidateUserDataCache } from '../../contexts/auth/authUserDataCache';

const ClientOnboardingContent = () => {
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
    if (!authState.isAuthenticated || authState.userType !== 'client') {
      navigate('/login');
    }
  }, [authState.isAuthenticated, authState.userType, authState.userId, navigate]);

  useEffect(() => {
    if (onboardingState.isCompleted) {
      toast.success('Onboarding completed! Redirecting to your profile...');
      setTimeout(() => {
        navigate('/client-profile');
      }, 2000);
    }
  }, [onboardingState.isCompleted, navigate]);

  const renderStepContent = () => {
    switch (onboardingState.currentStep) {
      case 1:
        return <ClientDetailsStep />;
      case 2:
        return <ProjectDetailsStep />;
      case 3:
        return <BudgetStep />;
      case 4:
        return <ReviewAndSubmitStep isLoading={isLoading} setIsLoading={setIsLoading} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <OnboardingLayout
      title="Client Profile Setup"
      subtitle="Complete your profile to start finding developers"
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

const ClientOnboarding = () => {
  return (
    <OnboardingProvider totalSteps={4} userType="client">
      <ClientOnboardingContent />
    </OnboardingProvider>
  );
};

export default ClientOnboarding;
