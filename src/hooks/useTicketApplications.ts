import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export interface HelpRequestMatch {
  id: string;
  developer_id: string;
  match_score: number;
  proposed_duration: number;
  proposed_message: string;
  proposed_rate: number;
  request_id: string;
  status: string;
  updated_at: string;
  profiles?: {
    id?: string;
    name?: string;
    image?: string;
    experience?: string;
  };
}

export const useTicketApplications = (ticketId: string) => {
  const [applications, setApplications] = useState<HelpRequestMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'match_score'>('created_at');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('help_request_matches')
        .select(`
          *,
          profiles:developer_id (id, name, image, experience)
        `)
        .eq('request_id', ticketId)
        .order(sortBy, { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Type assertion to ensure the data matches our expected structure
      const typedData = data as unknown as HelpRequestMatch[];
      setApplications(typedData || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load applications';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchApplications();
    }
  }, [ticketId, sortBy, statusFilter]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!ticketId) return;

    const channel = supabase
      .channel(`applications-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_request_matches',
          filter: `request_id=eq.${ticketId}`,
        },
        () => {
          console.log('[Applications] Update received, refreshing data');
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  return {
    applications,
    isLoading,
    error,
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
    refetch: fetchApplications,
  };
};
