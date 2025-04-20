
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { useAuth } from '../../../contexts/auth';
import { Button } from '../../ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StepButtonsProps {
  totalSteps: number;
  onSubmit: (e: React.FormEvent) => void;
}

const StepButtons: React.FC<StepButtonsProps> = ({ totalSteps, onSubmit }) => {
  const { currentStep, isSubmitting, prevStep, nextStep } = useHelpRequest();
  const { userType } = useAuth();
  
  const handleSubmit = (e: React.FormEvent) => {
    // Prevent developers from submitting help requests
    if (userType === 'developer') {
      e.preventDefault();
      toast.error("Developers cannot create help requests");
      return;
    }
    
    onSubmit(e);
  };
  
  return (
    <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
      {/* Back button (hidden on first step) */}
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isSubmitting}
          className="px-6"
        >
          Back
        </Button>
      ) : (
        <div></div> // Empty div to maintain flex spacing
      )}
      
      {/* Next or Submit button */}
      {currentStep < totalSteps ? (
        <Button
          type="button"
          onClick={nextStep}
          disabled={isSubmitting}
          className="px-6"
        >
          Continue
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={isSubmitting || userType === 'developer'}
          className="px-6"
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Request'
          )}
        </Button>
      )}
    </div>
  );
};

export default StepButtons;
