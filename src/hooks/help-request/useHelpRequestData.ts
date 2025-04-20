
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { getHelpRequest } from '../../integrations/supabase/helpRequests';
import { isApiSuccess, isApiError } from '../../types/api';
import { toast } from 'sonner';

export const useHelpRequestData = (
  ticketId?: string,
  initialData?: HelpRequest
) => {
  const [ticket, setTicket] = useState<HelpRequest | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData && !!ticketId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!ticketId || initialData) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getHelpRequest(ticketId);
        
        if (isApiSuccess(response)) {
          setTicket(response.data);
        } else if (isApiError(response)) {
          setError(response.error || "Failed to load ticket details");
          toast.error(response.error || "Failed to load ticket details");
        }
      } catch (err) {
        setError("An unexpected error occurred while loading the ticket");
        toast.error("Failed to load ticket details");
        console.error("Error fetching ticket:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketData();
  }, [ticketId, initialData]);

  const updateTicketData = (updatedTicket: HelpRequest) => {
    setTicket(updatedTicket);
  };

  return {
    ticket,
    setTicket: updateTicketData,
    isLoading,
    error
  };
};
