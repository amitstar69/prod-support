
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Button } from '../../../../components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ReviewAndSubmitStepProps {
  goToPreviousStep: () => void;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const ReviewAndSubmitStep: React.FC<ReviewAndSubmitStepProps> = ({
  goToPreviousStep,
  completeOnboarding,
  isLoading,
  setIsLoading
}) => {
  const { state } = useOnboarding();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<Record<string, any>>({});
  
  useEffect(() => {
    // Combine all step data
    const combinedData = {
      ...state.stepData[1],
      ...state.stepData[2],
      ...state.stepData[3]
    };
    
    setProfileData(combinedData);
  }, [state.stepData]);

  const formatList = (items: string[] | undefined) => {
    if (!items || items.length === 0) return 'None selected';
    
    return items.map(item => {
      // Convert kebab-case or snake_case to readable format
      return item.replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }).join(', ');
  };
  
  const handleCompleteProfile = async () => {
    setIsLoading(true);
    
    try {
      await completeOnboarding();
      toast.success('Profile setup completed!');
      
      setTimeout(() => {
        navigate('/client-dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('There was an error completing your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingLayout
      title="Review Your Profile"
      subtitle="Please review your information before completing your profile setup"
      onNextStep={handleCompleteProfile}
      onBackStep={goToPreviousStep}
      nextDisabled={isLoading}
      nextLabel="Complete Setup"
    >
      <div className="space-y-6">
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-lg">Your Profile Summary</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Company & Role</h4>
              <p>{profileData.company || 'Not specified'} {profileData.position ? `- ${profileData.position}` : ''}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Industry</h4>
              <p>{profileData.industry || 'Not specified'}</p>
            </div>
            
            {profileData.bio && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Introduction</h4>
                <p className="text-sm">{profileData.bio}</p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Project Types</h4>
              <p>{formatList(profileData.projectTypes)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Tech Stack</h4>
              <p>{formatList(profileData.techStack)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Budget Preference</h4>
              {profileData.budgetPreference === 'hourly' ? (
                <p>${profileData.hourlyBudget || '0'} per hour</p>
              ) : (
                <p>${profileData.totalBudget || '0'} fixed budget</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <p className="text-sm text-muted-foreground">
            You can always update your profile information later from your profile settings.
          </p>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              disabled={isLoading}
            >
              Back to Edit
            </Button>
            
            <Button 
              onClick={handleCompleteProfile}
              disabled={isLoading}
            >
              {isLoading ? 'Completing...' : 'Complete Setup'}
            </Button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default ReviewAndSubmitStep;
