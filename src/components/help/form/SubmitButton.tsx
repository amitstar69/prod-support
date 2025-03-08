
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Loader2, Send, Info } from 'lucide-react';
import { Button } from '../../ui/button';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Component that renders the submit button for the help request form
 * and displays authentication status information
 */
const SubmitButton: React.FC = () => {
  const { isSubmitting, validateForm } = useHelpRequest();
  const { userId } = useAuth();
  
  const isLocalStorage = userId?.startsWith('client-');
  const isAuthenticated = !!userId && !isLocalStorage;
  
  const handleFormValidation = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Client-side validation before form submission
    if (!validateForm()) {
      e.preventDefault();
    }
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
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            <span>Submit Help Request</span>
          </>
        )}
      </Button>
      
      {!isAuthenticated && (
        <div className="mt-3 p-3 border border-yellow-200 bg-yellow-50 rounded-md flex items-start gap-2">
          <Info className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">
            You're using a temporary account. Your request will be stored locally on this device only. 
            To save to the database and access from any device, please create an account or log in.
          </p>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        After submitting, you'll be able to track your request status.
      </p>
    </div>
  );
};

export default SubmitButton;
