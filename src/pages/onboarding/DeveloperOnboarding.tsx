import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import DeveloperSkillsStep from './steps/developer/DeveloperSkillsStep';
import DeveloperCategoryStep from './steps/developer/DeveloperCategoryStep';
import DeveloperExperienceStep from './steps/developer/DeveloperExperienceStep';
import DeveloperAvailabilityStep from './steps/developer/DeveloperAvailabilityStep';
import DeveloperBioStep from './steps/developer/DeveloperBioStep';
import { invalidateUserDataCache } from '../../contexts/auth/authUserDataCache';

const DeveloperOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const totalSteps = 5;

  useEffect(() => {
    if (authState.userId) {
      invalidateUserDataCache(authState.userId);
    }
    // Redirect if not authenticated or wrong user type
    if (!authState.isAuthenticated || authState.userType !== 'developer') {
      navigate('/login');
    }
  }, [authState.isAuthenticated, authState.userType, authState.userId, navigate]);

  return (
    <OnboardingProvider totalSteps={totalSteps} userType="developer">
      <OnboardingLayout title="Developer Profile Setup" totalSteps={totalSteps}>
        {/* Onboarding Steps */}
        <DeveloperSkillsStep step={1} />
        <DeveloperCategoryStep step={2} />
        <DeveloperExperienceStep step={3} />
        <DeveloperAvailabilityStep step={4} />
        <DeveloperBioStep step={5} />
      </OnboardingLayout>
    </OnboardingProvider>
  );
};

export default DeveloperOnboarding;
