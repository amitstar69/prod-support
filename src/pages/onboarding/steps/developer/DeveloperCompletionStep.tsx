
import React from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { CheckCircle } from 'lucide-react';

const DeveloperCompletionStep: React.FC = () => {
  const { completeOnboarding, userData, skipOnboarding } = useOnboarding();
  
  const handleSubmit = async () => {
    await completeOnboarding();
  };
  
  return (
    <OnboardingLayout 
      title="Profile Complete!"
      subtitle="Your developer profile is ready to be listed"
      onNextStep={handleSubmit}
      nextLabel="Complete Profile"
      showSkip={true}
      onSkip={skipOnboarding}
    >
      <div className="space-y-8">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Profile Information Ready</h3>
            <p className="text-muted-foreground">
              You've completed all the steps to set up your developer profile!
            </p>
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Your Name</h4>
            <p className="text-base">{userData.name}</p>
          </div>
          
          {userData && 'category' in userData && userData.category && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Primary Specialization</h4>
              <p className="text-base">{userData.category}</p>
            </div>
          )}
          
          {userData && 'skills' in userData && userData.skills && userData.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Skills</h4>
              <p className="text-base">{userData.skills.join(', ')}</p>
            </div>
          )}
          
          {userData && 'hourlyRate' in userData && userData.hourlyRate && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Rates</h4>
              <p className="text-base">${userData.hourlyRate}/hour • ${userData.minuteRate}/minute</p>
            </div>
          )}
          
          {userData && 'availability' in userData && userData.availability && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Availability</h4>
              <p className="text-base">
                {typeof userData.availability === 'boolean' 
                  ? (userData.availability ? 'Available for work' : 'Not currently available') 
                  : `${userData.availability.days?.join(', ')} • ${userData.availability.hours}`}
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            After completing your profile, you'll be able to receive help requests from clients
            and start providing assistance through chat, voice, or video sessions.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperCompletionStep;
