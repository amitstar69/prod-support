
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Loader2, Send } from 'lucide-react';

const SubmitButton: React.FC = () => {
  const { isSubmitting } = useHelpRequest();

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full py-3 px-6 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
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
