
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { getHelpRequest } from '../../integrations/supabase/helpRequestsCore';

export const useHelpRequestData = (ticketId?: string, initialTicket?: HelpRequest) => {
  const [ticket, setTicket] = useState<HelpRequest | null>(initialTicket || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialTicket && !!ticketId);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = async () => {
    if (!ticketId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getHelpRequest(ticketId);
      
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

  const refetchTicket = () => {
    return fetchTicket();
  };

  useEffect(() => {
    if (ticketId && !initialTicket) {
      fetchTicket();
    }
  }, [ticketId, initialTicket]);

  return { ticket, setTicket, isLoading, error, refetchTicket };
};
