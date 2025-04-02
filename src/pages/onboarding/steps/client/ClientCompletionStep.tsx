
import React from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { CheckCircle } from 'lucide-react';
import { useAuth, invalidateUserDataCache } from '../../../../contexts/auth';
import { toast } from 'sonner';

const ClientCompletionStep: React.FC = () => {
  const { completeOnboarding, userData, skipOnboarding } = useOnboarding();
  const { userId } = useAuth();
  
  const handleSubmit = async () => {
    // Show a loading toast
    const loadingToast = toast.loading('Completing your profile...');
    
    try {
      // Force a complete cache invalidation before completing onboarding
      if (userId) {
        console.log('Invalidating cache before completing onboarding');
        invalidateUserDataCache(userId);
        
        // Add a small delay to ensure cache invalidation is processed
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Then complete the onboarding process
      const success = await completeOnboarding();
      
      // Clear the loading toast
      toast.dismiss(loadingToast);
      
      if (!success) {
        toast.error('There was an issue completing your profile. Please try again.');
      }
    } catch (error) {
      // Clear the loading toast and show error
      toast.dismiss(loadingToast);
      console.error('Error during profile completion:', error);
      toast.error('There was an unexpected error completing your profile. Please try again.');
    }
  };
  
  return (
    <OnboardingLayout 
      title="You're Almost Done!"
      subtitle="Review your information and complete your profile"
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
              You've provided all the information we need to get you started!
            </p>
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Your Name</h4>
            <p className="text-base">{userData.name}</p>
          </div>
          
          {userData && 'company' in userData && userData.company && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
              <p className="text-base">{userData.company}</p>
            </div>
          )}
          
          {userData && 'industry' in userData && userData.industry && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Industry</h4>
              <p className="text-base">{userData.industry}</p>
            </div>
          )}
          
          {userData && 'techStack' in userData && userData.techStack && userData.techStack.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Technologies</h4>
              <p className="text-base">{userData.techStack.join(', ')}</p>
            </div>
          )}
          
          {userData && 'projectTypes' in userData && userData.projectTypes && userData.projectTypes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Project Types</h4>
              <p className="text-base">{userData.projectTypes.join(', ')}</p>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            By completing your profile, you'll be able to request help from our developer network
            and get matched with the perfect expert for your needs.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default ClientCompletionStep;
