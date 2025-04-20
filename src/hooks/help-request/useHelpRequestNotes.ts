
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';

export const useHelpRequestNotes = (ticket: HelpRequest | null | undefined) => {
  const [developerQANotes, setDeveloperQANotes] = useState<string>('');
  const [clientFeedback, setClientFeedback] = useState<string>('');
  
  // Update local state when ticket data changes
  useEffect(() => {
    if (ticket) {
      setDeveloperQANotes(ticket.developer_qa_notes || '');
      setClientFeedback(ticket.client_feedback || '');
    }
  }, [ticket]);
  
  const resetNotes = () => {
    if (ticket) {
      setDeveloperQANotes(ticket.developer_qa_notes || '');
      setClientFeedback(ticket.client_feedback || '');
    } else {
      setDeveloperQANotes('');
      setClientFeedback('');
    }
  };
  
  return {
    developerQANotes,
    clientFeedback,
    setDeveloperQANotes,
    setClientFeedback,
    resetNotes
  };
};
