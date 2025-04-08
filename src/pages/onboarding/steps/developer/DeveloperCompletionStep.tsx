
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { BadgeCheck, Users, Sparkles } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import DeveloperVerificationPayment from '../../../../components/auth/DeveloperVerificationPayment';

const DeveloperCompletionStep = () => {
  const [step, setStep] = useState<'complete' | 'verification'>('complete');
  const { completeOnboarding, skipOnboarding, isLoading } = useOnboarding();
  const navigate = useNavigate();

  const handleCompleteOnboarding = async () => {
    await completeOnboarding();
  };

  const handleSkipVerification = async () => {
    toast.info('You can verify your account later from your profile settings');
    await completeOnboarding();
  };

  const handleShowVerification = () => {
    setStep('verification');
  };

  if (step === 'verification') {
    return (
      <div className="container mx-auto px-4 py-8">
        <DeveloperVerificationPayment 
          onSkip={handleSkipVerification}
          onSuccess={() => {
            // This will be called after returning from successful payment
            completeOnboarding();
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full">
            <BadgeCheck className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl font-semibold text-center mb-2">Profile Complete!</h1>
        <p className="text-center text-muted-foreground mb-8">
          Congratulations! You've successfully set up your developer profile.
        </p>
        
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Verify Your Developer Account
            </h2>
            <p className="mb-4">
              Get a verified badge on your profile, priority placement in search results, 
              and access to premium clients by completing verification.
            </p>
            <Button 
              onClick={handleShowVerification}
              className="w-full"
            >
              Verify My Account
            </Button>
          </div>
          
          <div className="bg-card border border-border p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Start Helping Clients
            </h2>
            <p className="mb-4">
              Skip verification for now and start browsing help requests. 
              You can always verify your account later from your profile settings.
            </p>
            <Button 
              variant="outline" 
              onClick={handleCompleteOnboarding}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Completing Profile...' : 'Complete Setup & Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperCompletionStep;
