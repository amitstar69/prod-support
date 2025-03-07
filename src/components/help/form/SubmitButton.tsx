
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Loader2, Send } from 'lucide-react';
import { Button } from '../../ui/button';

const SubmitButton: React.FC = () => {
  const { isSubmitting, validateForm } = useHelpRequest();
  
  return (
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
  );
};

export default SubmitButton;
