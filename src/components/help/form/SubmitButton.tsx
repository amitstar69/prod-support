
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Loader2, Send } from 'lucide-react';

const SubmitButton: React.FC = () => {
  const { isSubmitting, validateForm } = useHelpRequest();
  
  // Get validation state for visual feedback
  const isValid = validateForm();

  return (
    <button
      type="submit"
      disabled={isSubmitting || !isValid}
      className={`w-full py-3 px-6 text-white rounded-md transition-colors flex items-center justify-center gap-2 ${
        isValid ? 'bg-primary hover:bg-primary/90' : 'bg-gray-400'
      } disabled:opacity-70`}
      aria-live="polite"
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
    </button>
  );
};

export default SubmitButton;
