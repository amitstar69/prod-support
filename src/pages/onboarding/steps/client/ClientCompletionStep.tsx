
import React from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Button } from '../../../../components/ui/button';
import { CheckCircle } from 'lucide-react';

const ClientCompletionStep: React.FC = () => {
  const { completeOnboarding, isLoading } = useOnboarding();
  
  return (
    <OnboardingLayout
      title="Profile Complete!"
      subtitle="You're all set to start finding help for your projects"
      showStepIndicator={false}
      showNextButton={false}
      showBackButton={false}
    >
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-24 h-24 text-primary" />
        </div>
        
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold">Your profile is ready</h3>
          <p className="text-muted-foreground">
            You've successfully completed all the required steps to set up your profile.
            You're now ready to start finding the perfect developers for your projects.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => completeOnboarding()}
            disabled={isLoading}
          >
            {isLoading ? 'Completing...' : 'Go to Dashboard'}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default ClientCompletionStep;
