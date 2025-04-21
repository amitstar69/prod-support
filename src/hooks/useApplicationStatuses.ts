
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface ApplicationStatus {
  id: string;
  label: string;
  value: string;
}

interface UseApplicationStatusesResult {
  statuses: ApplicationStatus[];
  isLoading: boolean;
  error: string | null;
}

export const useApplicationStatuses = (): UseApplicationStatusesResult => {
  const [statuses, setStatuses] = useState<ApplicationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch statuses from Supabase
        const { data, error: fetchError } = await supabase
          .from('help_request_status_types')
          .select('*')
          .order('display_order', { ascending: true });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (data) {
          const formattedStatuses = data.map(status => ({
            id: status.id,
            label: status.display_name,
            value: status.status_code
          }));
          setStatuses(formattedStatuses);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load status options');
        console.error('Error fetching application statuses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  return { statuses, isLoading, error };
};
