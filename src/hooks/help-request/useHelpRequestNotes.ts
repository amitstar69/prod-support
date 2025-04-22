
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';

export const useHelpRequestNotes = (ticket: HelpRequest | null) => {
  const [developerQANotes, setDeveloperQANotes] = useState<string>('');
  const [clientFeedback, setClientFeedback] = useState<string>('');

  // Initialize notes from ticket when it changes
  useEffect(() => {
    if (ticket) {
      setDeveloperQANotes(ticket.developer_qa_notes || '');
      setClientFeedback(ticket.client_feedback || '');
    }
  }, [ticket]);

  return {
    developerQANotes,
    clientFeedback,
    setDeveloperQANotes,
    setClientFeedback
  };
};
