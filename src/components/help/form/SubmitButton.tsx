
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Button } from '../../ui/button';
import { useAuth } from '../../../contexts/auth';
import AuthWarning from './AuthWarning';
import SubmitButtonContent from './SubmitButtonContent';
import { toast } from "sonner";

/**
 * Component that renders the submit button for the help request form
 * and displays authentication status information
 */
const SubmitButton: React.FC = () => {
  const { isSubmitting, validateForm } = useHelpRequest();
  const { isAuthenticated, userId } = useAuth();
  
  const handleFormValidation = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Only do client-side validation if button isn't already in submitting state
    if (isSubmitting) {
      e.preventDefault();
      return;
    }
    
    // Check if form is valid
    if (!validateForm()) {
      e.preventDefault();
      toast.error("Please fill out all required fields");
    }
    
    // Form is valid and will submit normally through the form's onSubmit handler
  };

  return (
    <div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 py-3 px-6 text-white rounded-md transition-colors flex items-center justify-center gap-2"
        aria-live="polite"
        onClick={handleFormValidation}
      >
        <SubmitButtonContent isSubmitting={isSubmitting} />
      </Button>
      
      {!isAuthenticated && <AuthWarning />}
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        After submitting, you'll be able to track your request status.
      </p>
    </div>
  );
};

export default SubmitButton;
