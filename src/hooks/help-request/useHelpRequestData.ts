
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { getHelpRequest } from '../../integrations/supabase/helpRequestsCore';

export const useHelpRequestData = (ticketId?: string, initialTicket?: HelpRequest) => {
  const [ticket, setTicket] = useState<HelpRequest | null>(initialTicket || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialTicket && !!ticketId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticketId && !initialTicket) {
      fetchTicket();
    }
  }, [ticketId, initialTicket]);

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const response = await getHelpRequest(ticketId!);
      
      if (response.success && response.data) {
        setTicket(response.data as HelpRequest);
      } else {
        setError(response.error || 'Failed to load ticket details');
      }
    } catch (err) {
      setError('Failed to load ticket details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { ticket, setTicket, isLoading, error };
};
