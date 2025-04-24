import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';

export const useTicketData = (ticketId: string) => {
  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First query for the help request
        const { data: requestData, error: ticketError } = await supabase
          .from('help_requests')
          .select(`
            *,
            client:client_id(id, name, email)
          `)
          .eq('id', ticketId)
          .single();

        if (ticketError) throw ticketError;
        
        // Now get the developer info from help_request_matches if available
        const { data: matchData } = await supabase
          .from('help_request_matches')
          .select(`
            developer_id,
            status,
            developer:developer_id(id, name, email)
          `)
          .eq('request_id', ticketId)
          .eq('status', 'approved')
          .maybeSingle();
        
        // Combine the data
        const fullTicket: HelpRequest = {
          ...requestData,
          developer_id: matchData?.developer_id || null,
          // Store developer profile data in appropriate fields according to HelpRequest type
          // or keep it on the request object for accessing in the UI
          application_status: matchData?.status || null
        };
        
        // Store the full ticket with developer information for UI purposes
        setTicket({
          ...fullTicket,
          // Assign the developer information to the ticket object
          // We're attaching this for UI purposes, even though it's not in the HelpRequest type
          ...((matchData?.developer) ? { 
            developer_id: matchData.developer_id,
            // @ts-ignore - We're ignoring type checking here as we need this data in the UI
            developer: matchData.developer 
          } : {})
        } as HelpRequest);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to load ticket details';
        console.error('Error fetching ticket:', err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();

    // Set up realtime subscription
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
          filter: `id=eq.${ticketId}`
        },
        (payload) => {
          console.log('Ticket updated:', payload);
          setTicket(current => {
            if (!current) return null;
            return { ...current, ...payload.new };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  const updateTicket = async (updates: Record<string, any>) => {
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      
      setTicket(prevTicket => {
        if (!prevTicket) return data as HelpRequest;
        return { ...prevTicket, ...data } as HelpRequest;
      });
      
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update ticket';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return { ticket, setTicket, isLoading, error, updateTicket };
};
