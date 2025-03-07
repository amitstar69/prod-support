
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Loader2, Send } from 'lucide-react';
import { Button } from '../../ui/button';

const SubmitButton: React.FC = () => {
  const { isSubmitting, validateForm } = useHelpRequest();
  
  return (
    <div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 py-3 px-6 text-white rounded-md transition-colors flex items-center justify-center gap-2"
        aria-live="polite"
        onClick={(e) => {
          // Client-side validation before form submission
          if (!validateForm()) {
            e.preventDefault();
          }
        }}
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
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Note: If you're using a local account (not logged in with email), your request will be stored locally.
      </p>
    </div>
  );
};

export default SubmitButton;
