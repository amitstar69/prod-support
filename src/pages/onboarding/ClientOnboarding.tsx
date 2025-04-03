import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { useOnboarding } from '../../contexts/OnboardingContext';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import ClientDetailsStep from './steps/client/ClientDetailsStep';
import ProjectDetailsStep from './steps/client/ProjectDetailsStep';
import BudgetStep from './steps/client/BudgetStep';
import ReviewAndSubmitStep from './steps/client/ReviewAndSubmitStep';
import { toast } from 'sonner';
import { invalidateUserDataCache } from '../../contexts/auth/authUserDataCache';

const ClientOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { state: onboardingState, goToNextStep, goToPreviousStep, goToStep, setStepData, completeOnboarding } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authState.userId) {
      invalidateUserDataCache(authState.userId);
    }
  }, [authState.userId]);

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
        return <ClientDetailsStep goToNextStep={goToNextStep} setStepData={setStepData} />;
      case 2:
        return <ProjectDetailsStep goToNextStep={goToNextStep} goToPreviousStep={goToPreviousStep} setStepData={setStepData} />;
      case 3:
        return <BudgetStep goToNextStep={goToNextStep} goToPreviousStep={goToPreviousStep} setStepData={setStepData} />;
      case 4:
        return <ReviewAndSubmitStep 
                  goToPreviousStep={goToPreviousStep} 
                  completeOnboarding={completeOnboarding} 
                  isLoading={isLoading} 
                  setIsLoading={setIsLoading} 
                />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <OnboardingLayout currentStep={onboardingState.currentStep} totalSteps={onboardingState.totalSteps} goToStep={goToStep}>
      {renderStepContent()}
    </OnboardingLayout>
  );
};

export default ClientOnboarding;
