
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { getHelpRequest } from '../../integrations/supabase/helpRequests';
import { isApiSuccess, isApiError } from '../../types/api';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/auth';

export const useHelpRequestData = (
  ticketId?: string,
  initialData?: HelpRequest
) => {
  const [ticket, setTicket] = useState<HelpRequest | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData && !!ticketId);
  const [error, setError] = useState<string | null>(null);
  const { userId, userType } = useAuth();

  // Function to check if the developer is matched with this help request
  const checkDeveloperMatch = async (requestId: string, developerId: string | null) => {
    if (!developerId || userType !== 'developer') return null;
    
    try {
      const { data, error } = await supabase
        .from('help_request_matches')
        .select('status')
        .eq('request_id', requestId)
        .eq('developer_id', developerId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking developer match:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Exception checking developer match:', err);
      return null;
    }
  };

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
          
          // If user is a developer, check if they're matched with this request
          if (userType === 'developer' && userId) {
            const matchData = await checkDeveloperMatch(ticketId, userId);
            
            // If they're not matched or the match is not approved, show a warning
            if (!matchData) {
              toast.warning("You are not assigned to this help request", {
                description: "You can view the details but cannot update the status.",
                duration: 5000
              });
            } else if (matchData.status !== 'approved') {
              toast.warning(`Your application status is: ${matchData.status}`, {
                description: "You need approved status to update this request.",
                duration: 5000
              });
            }
          }
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
  }, [ticketId, initialData, userId, userType]);

  useEffect(() => {
    // Set up real-time subscription for ticket updates
    if (!ticketId) return;
    
    const channel = supabase
      .channel(`help_request_${ticketId}`)
      .on('postgres_changes', { 
        event: 'UPDATE',
        schema: 'public',
        table: 'help_requests',
        filter: `id=eq.${ticketId}`
      }, (payload) => {
        console.log('Help request updated:', payload);
        if (payload.new) {
          setTicket(payload.new as HelpRequest);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

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
