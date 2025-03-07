
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Loader2, Send } from 'lucide-react';

const SubmitButton: React.FC = () => {
  const { isSubmitting } = useHelpRequest();
  
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`w-full py-3 px-6 text-white rounded-md transition-colors flex items-center justify-center gap-2 
        bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed`}
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
