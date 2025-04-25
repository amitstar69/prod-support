
import { useState, useEffect, useMemo } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { HELP_REQUEST_STATUSES } from '../../utils/constants/statusConstants';

export interface FilterState {
  status: string;
  technicalArea: string;
  urgency: string;
}

export interface CategorizedTickets {
  activeTickets: HelpRequest[];
  inProgressTickets: HelpRequest[];
  completedTickets: HelpRequest[];
  pendingApprovalTickets: HelpRequest[];
}

export interface UseTicketFiltersResult {
  filters: FilterState;
  filteredTickets: HelpRequest[];
  categorizedTickets: CategorizedTickets;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  handleFilterChange: (filterType: string, value: string) => void;
  applyFilters: (tickets: HelpRequest[]) => HelpRequest[];
  resetFilters: () => void;
  getFilteredTickets: (userType: string) => CategorizedTickets;
}

// Status category definitions
const ACTIVE_STATUSES = [
  'open', 
  'submitted', 
  'pending_match',
  'matching' // Added to catch more tickets
];

const IN_PROGRESS_STATUSES = [
  'approved', 
  'requirements_review', 
  'need_more_info',
  'in_progress', 
  'ready_for_qa', 
  'ready_for_client_qa',
  'qa_fail', 
  'qa_pass', 
  'ready_for_final_action'
];

const COMPLETED_STATUSES = [
  'resolved'
];

const PENDING_APPROVAL_STATUSES = [
  'dev_requested', 
  'awaiting_client_approval'
];

export const useTicketFilters = (tickets: HelpRequest[]): UseTicketFiltersResult => {
  const [filteredTickets, setFilteredTickets] = useState<HelpRequest[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    technicalArea: 'all',
    urgency: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Categorize tickets based on their status
  const categorizedTickets = useMemo(() => {
    const active: HelpRequest[] = [];
    const inProgress: HelpRequest[] = [];
    const completed: HelpRequest[] = [];
    const pendingApproval: HelpRequest[] = [];

    (tickets || []).forEach(ticket => {
      const status = ticket.status?.toLowerCase() || '';
      
      if (ACTIVE_STATUSES.includes(status)) {
        active.push(ticket);
      } else if (IN_PROGRESS_STATUSES.includes(status)) {
        inProgress.push(ticket);
      } else if (COMPLETED_STATUSES.includes(status)) {
        completed.push(ticket);
      } else if (PENDING_APPROVAL_STATUSES.includes(status)) {
        pendingApproval.push(ticket);
      } else {
        // If status doesn't match any category, default to active
        active.push(ticket);
      }
    });

    // Sort tickets by created_at (newest first)
    const sortByNewest = (a: HelpRequest, b: HelpRequest) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    };

    return {
      activeTickets: active.sort(sortByNewest),
      inProgressTickets: inProgress.sort(sortByNewest),
      completedTickets: completed.sort(sortByNewest),
      pendingApprovalTickets: pendingApproval.sort(sortByNewest)
    };
  }, [tickets]);

  // Apply filters whenever tickets or filter criteria change
  useEffect(() => {
    const result = applyFilters(tickets);
    setFilteredTickets(result);
  }, [tickets, filters]);

  const applyFilters = (ticketsToFilter: HelpRequest[]): HelpRequest[] => {
    let result = [...ticketsToFilter];
    
    if (filters.status !== 'all') {
      result = result.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.technicalArea !== 'all') {
      result = result.filter(ticket => 
        ticket.technical_area && ticket.technical_area.includes(filters.technicalArea)
      );
    }
    
    if (filters.urgency !== 'all') {
      result = result.filter(ticket => ticket.urgency === filters.urgency);
    }
    
    return result;
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      technicalArea: 'all',
      urgency: 'all',
    });
  };

  const getFilteredTickets = (userType: string): CategorizedTickets => {
    // Return the categorized tickets regardless of user type
    return categorizedTickets;
  };

  return {
    filters,
    filteredTickets,
    categorizedTickets,
    showFilters,
    setShowFilters,
    handleFilterChange,
    applyFilters,
    resetFilters,
    getFilteredTickets
  };
};
