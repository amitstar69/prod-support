
import { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { VALID_MATCH_STATUSES } from '../../integrations/supabase/helpRequestsApplications';

export const useMyTicketApplications = () => {
  const [myApplications, setMyApplications] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyApplications = async (
    isAuthenticated: boolean,
    currentUserId: string | null
  ) => {
    if (!isAuthenticated || !currentUserId) {
      setMyApplications([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a manual timeout instead of using AbortController
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out'));
        }, 10000);
      });
      
      const fetchPromise = supabase
        .from('help_request_matches')
        .select('*, help_requests(*)')
        .eq('developer_id', currentUserId)
        .eq('status', VALID_MATCH_STATUSES.APPROVED);
      
      // Race between the fetch and the timeout
      const { data: applications, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => {
          console.log('Fetch applications request timed out');
          throw new Error('Request timed out');
        })
      ]) as any;

      if (error) {
        console.error('Failed to load applications:', error);
        toast.error('Failed to load your approved applications');
        setMyApplications([]);
        return;
      }
      
      if (!applications || applications.length === 0) {
        setMyApplications([]);
        return;
      }
      
      const approvedTickets = applications
        .filter(app => app.help_requests)
        .map(app => ({
          ...app.help_requests,
          developer_id: currentUserId,
          application_id: app.id,
          application_status: app.status
        })) as HelpRequest[];
      
      setMyApplications(approvedTickets);
    } catch (error) {
      console.error('Error fetching applications:', error);
      if (error instanceof Error && error.message === 'Request timed out') {
        toast.error('Request timed out. Please check your connection');
      } else {
        toast.error('An unexpected error occurred while fetching your applications');
      }
      setMyApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { myApplications, fetchMyApplications, isLoading };
};
