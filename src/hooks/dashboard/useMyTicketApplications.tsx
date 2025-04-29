
import { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { MATCH_STATUSES } from '../../utils/constants/statusConstants';

// Helper function to normalize attachments to array
const normalizeAttachments = (attachments: any): any[] => {
  if (!attachments) {
    return [];
  }
  
  if (Array.isArray(attachments)) {
    return attachments;
  }
  
  if (typeof attachments === 'string') {
    try {
      const parsed = JSON.parse(attachments);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  
  return [];
};

export const useMyTicketApplications = () => {
  const [myApplications, setMyApplications] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dataSource, setDataSource] = useState<string>('cache');

  const processHelpRequest = (request: any): HelpRequest => {
    return {
      ...request,
      attachments: normalizeAttachments(request.attachments)
    } as HelpRequest;
  };

  const fetchMyApplications = async (isAuthenticated: boolean, userId: string | null) => {
    if (!isAuthenticated || !userId) {
      setMyApplications([]);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    
    try {
      // First, get all applications by the current developer
      const { data: applications, error: applicationsError } = await supabase
        .from('help_request_matches')
        .select('*, request_id')
        .eq('developer_id', userId);

      if (applicationsError) {
        console.error('[MyApplications] Error fetching applications:', applicationsError);
        throw applicationsError;
      }

      if (!applications || applications.length === 0) {
        setMyApplications([]);
        setIsLoading(false);
        setDataSource('api');
        return;
      }

      // Get the request IDs from the applications
      const requestIds = applications.map(app => app.request_id);

      // Fetch the help requests for those IDs
      const { data: requests, error: requestsError } = await supabase
        .from('help_requests')
        .select('*')
        .in('id', requestIds);

      if (requestsError) {
        console.error('[MyApplications] Error fetching help requests:', requestsError);
        throw requestsError;
      }

      // Map the help requests to include the application status
      const mappedRequests = requests.map((request: any) => {
        const application = applications.find(app => app.request_id === request.id);
        return processHelpRequest({
          ...request,
          isApplication: true,
          application_id: application?.id,
          application_status: application?.status,
          developer_id: userId,
        });
      });

      console.log('[MyApplications] Mapped requests:', mappedRequests);
      setMyApplications(mappedRequests);
      setDataSource('api');
    } catch (error) {
      console.error('[MyApplications] Error in fetchMyApplications:', error);
      toast.error('Failed to load your applications');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { myApplications, isLoading, hasError, fetchMyApplications, dataSource };
};
