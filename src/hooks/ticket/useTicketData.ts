
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
        
        const { data, error: ticketError } = await supabase
          .from('help_requests')
          .select(`
            *,
            client:client_id(id, name, email),
            developer:developer_id(id, name, email)
          `)
          .eq('id', ticketId)
          .single();

        if (ticketError) throw ticketError;
        
        setTicket(data as HelpRequest);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to load ticket details';
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

  const updateTicket = async (updates: Partial<HelpRequest>) => {
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      
      setTicket(data as HelpRequest);
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update ticket';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return { ticket, setTicket, isLoading, error, updateTicket };
};
