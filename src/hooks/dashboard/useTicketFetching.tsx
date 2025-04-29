
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest } from '../../types/helpRequest';
import { HELP_REQUEST_STATUSES } from '../../utils/constants/statusConstants';

interface UseTicketFetchingResult {
  tickets: HelpRequest[];
  isLoading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  category: string;
}

const determineTicketCategory = (status: string) => {
  // Map old statuses to new ones for compatibility
  const statusMapping = {
    'submitted': HELP_REQUEST_STATUSES.OPEN,
    'dev_requested': HELP_REQUEST_STATUSES.PENDING_MATCH,
    'pending_developer_approval': HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL
  };
  
  const normalizedStatus = statusMapping[status] || status;
  
  if ([
    HELP_REQUEST_STATUSES.OPEN, 
    HELP_REQUEST_STATUSES.PENDING_MATCH, 
    HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL
  ].includes(normalizedStatus)) {
    return 'open';
  }

  if ([
    HELP_REQUEST_STATUSES.IN_PROGRESS,
    HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL,
    HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW,
    HELP_REQUEST_STATUSES.NEED_MORE_INFO,
    HELP_REQUEST_STATUSES.READY_FOR_QA,
    HELP_REQUEST_STATUSES.READY_FOR_CLIENT_QA,
    HELP_REQUEST_STATUSES.QA_FAIL,
    HELP_REQUEST_STATUSES.QA_PASS,
    HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION
  ].includes(normalizedStatus)) {
    return 'inProgress';
  }

  if ([
    HELP_REQUEST_STATUSES.COMPLETED,
    HELP_REQUEST_STATUSES.RESOLVED
  ].includes(normalizedStatus)) {
    return 'completed';
  }

  return 'other';
};

export const useTicketFetching = (initialCategory: string): UseTicketFetchingResult => {
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(initialCategory);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('help_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        const helpRequestStatus = Object.values(HELP_REQUEST_STATUSES).find(status => determineTicketCategory(status) === category);
        if (helpRequestStatus) {
          query = query.eq('status', helpRequestStatus);
        } else {
          console.warn(`No matching status found for category: ${category}`);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Add proper type conversion for the attachments field
      const processedTickets = data?.map(ticket => {
        // Ensure attachments is always an array even if it comes as string or null
        let safeAttachments: any[] = [];
        
        if (ticket.attachments) {
          if (Array.isArray(ticket.attachments)) {
            safeAttachments = ticket.attachments;
          } else if (typeof ticket.attachments === 'string') {
            try {
              safeAttachments = JSON.parse(ticket.attachments);
              if (!Array.isArray(safeAttachments)) {
                safeAttachments = [];
              }
            } catch (e) {
              safeAttachments = [];
            }
          }
        }
        
        return {
          ...ticket,
          attachments: safeAttachments
        } as HelpRequest;
      }) || [];
      
      setTickets(processedTickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [category]);

  return { tickets, isLoading, error, fetchTickets, category };
};
