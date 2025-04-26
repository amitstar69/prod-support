
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequestMatch } from '../../types/helpRequest';
import { toast } from 'sonner';

export const useDeveloperApplications = (helpRequestId: string) => {
  const [applications, setApplications] = useState<HelpRequestMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data, error } = await supabase
          .from('help_request_matches')
          .select(`
            *,
            profiles:developer_id (
              id,
              name,
              image,
              description
            )
          `)
          .eq('request_id', helpRequestId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load applications';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (helpRequestId) {
      fetchApplications();
      
      // Set up real-time subscription
      const channel = supabase
        .channel(`applications-${helpRequestId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'help_request_matches',
            filter: `request_id=eq.${helpRequestId}`
          },
          () => {
            fetchApplications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [helpRequestId]);

  return { applications, isLoading, error };
};
