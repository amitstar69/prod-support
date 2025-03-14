
import React from 'react';
import { Loader2, Send } from 'lucide-react';

interface SubmitButtonContentProps {
  isSubmitting: boolean;
}

/**
 * Component that renders the appropriate content for the submit button
 * based on the submission status
 */
const SubmitButtonContent: React.FC<SubmitButtonContentProps> = ({ isSubmitting }) => {
  if (isSubmitting) {
    return (
      <>
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Submitting...</span>
      </>
    );
  }
  
  return (
    <>
      <Send className="h-5 w-5" />
      <span>Submit Help Request</span>
    </>
  );
};

export default SubmitButtonContent;
