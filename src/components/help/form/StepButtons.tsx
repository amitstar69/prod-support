
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Button } from '../../ui/button';
import { Loader2 } from 'lucide-react';

interface StepButtonsProps {
  totalSteps: number;
  onSubmit: (e: React.FormEvent) => void;
}

const StepButtons: React.FC<StepButtonsProps> = ({ totalSteps, onSubmit }) => {
  const { currentStep, isSubmitting, prevStep, nextStep } = useHelpRequest();
  
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
          disabled={isSubmitting}
          className="px-6"
          onClick={(e) => onSubmit(e)}
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
