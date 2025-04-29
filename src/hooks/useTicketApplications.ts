import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { HelpRequestMatch, DeveloperProfile } from '../types/helpRequest';
import { MATCH_STATUSES } from '../utils/constants/statusConstants';

export const useTicketApplications = (ticketId: string) => {
  const [applications, setApplications] = useState<HelpRequestMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'match_score'>('created_at');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pendingCount, setPendingCount] = useState(0);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('help_request_matches')
        .select(`
          *,
          profiles:developer_id (id, name, image, description, location),
          developer_profiles:developer_id (id, skills, experience, hourly_rate)
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
      
      // Ensure we have valid profiles data for each application
      const typedData = (data || []).map(app => {
        // Handle potentially malformed profiles data
        let safeProfiles = app.profiles;
        
        if (!safeProfiles || typeof safeProfiles !== 'object') {
          safeProfiles = { 
            id: app.developer_id, 
            name: 'Unknown Developer',
            image: null,
            description: '',
            location: ''
          };
        } else if (!safeProfiles.description) {
          safeProfiles.description = '';
        } else if (!safeProfiles.location) {
          safeProfiles.location = '';
        }

        // Handle potentially malformed developer_profiles data
        let safeDeveloperProfiles: DeveloperProfile = {
          id: app.developer_id,
          skills: [],
          experience: '',
          hourly_rate: 0
        };
        
        if (app.developer_profiles && typeof app.developer_profiles === 'object') {
          const dp = app.developer_profiles;
          safeDeveloperProfiles = {
            id: app.developer_id,
            skills: Array.isArray(dp?.skills) ? dp.skills : [],
            experience: typeof dp?.experience === 'string' ? dp.experience : '',
            hourly_rate: typeof dp?.hourly_rate === 'number' ? dp.hourly_rate : 0
          };
        }

        return {
          ...app,
          profiles: safeProfiles,
          developer_profiles: safeDeveloperProfiles
        } as HelpRequestMatch;
      });
      
      setApplications(typedData);
      
      // Calculate pending count
      const pendingApplications = typedData?.filter(app => app.status === MATCH_STATUSES.PENDING) || [];
      setPendingCount(pendingApplications.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load applications';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, sortBy, statusFilter]);

  useEffect(() => {
    if (ticketId) {
      fetchApplications();
    }
  }, [ticketId, fetchApplications]);

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
  }, [ticketId, fetchApplications]);

  return {
    applications,
    isLoading,
    error,
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
    pendingCount,
    refetch: fetchApplications,
  };
};
