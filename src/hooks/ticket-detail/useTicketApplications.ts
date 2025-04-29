
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequestMatch } from '../../types/helpRequest';

export const useTicketApplications = (ticketId: string, userId: string | null, isClient: boolean) => {
  const [applications, setApplications] = useState<HelpRequestMatch[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  useEffect(() => {
    if (!isClient || !ticketId || !userId) return;
    
    const fetchApplications = async () => {
      setIsLoadingApplications(true);
      try {
        const { data, error } = await supabase
          .from('help_request_matches')
          .select(`
            *,
            profiles:developer_id (id, name, image, description, location),
            developer_profiles:developer_id (id, skills, experience, hourly_rate)
          `)
          .eq('request_id', ticketId);
          
        if (error) {
          console.error('Error fetching applications:', error);
          return;
        }
        
        const typedApplications: HelpRequestMatch[] = (data || []).map(app => {
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
          }
          
          // Handle potentially malformed developer_profiles data
          let safeDeveloperProfiles = app.developer_profiles;
          
          if (!safeDeveloperProfiles || typeof safeDeveloperProfiles !== 'object') {
            safeDeveloperProfiles = {
              id: app.developer_id,
              skills: [],
              experience: '',
              hourly_rate: 0
            };
          }
          
          return {
            ...app,
            profiles: safeProfiles,
            developer_profiles: safeDeveloperProfiles
          } as HelpRequestMatch;
        });
        
        setApplications(typedApplications);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setIsLoadingApplications(false);
      }
    };
    
    fetchApplications();
    
    const channel = supabase
      .channel(`applications-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_request_matches',
          filter: `request_id=eq.${ticketId}`
        },
        () => {
          console.log('[TicketDetail] Applications updated, refreshing');
          fetchApplications();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, userId, isClient]);

  return { applications, isLoadingApplications };
};
