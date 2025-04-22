
import { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';

export const useHelpRequestNotes = (ticket: HelpRequest | null) => {
  const [developerQANotes, setDeveloperQANotes] = useState<string>('');
  const [clientFeedback, setClientFeedback] = useState<string>('');

  return {
    developerQANotes,
    clientFeedback,
    setDeveloperQANotes,
    setClientFeedback
  };
};
