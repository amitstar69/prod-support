
import { HelpRequest } from '../../types/helpRequest';
import { Developer } from '../../types/product';

export interface TicketWithScore extends HelpRequest {
  matchScore?: number;
}

export interface UseTicketRecommendationsResult {
  recommendedTickets: TicketWithScore[];
  availableTickets: HelpRequest[];
}

// Add the missing types
export interface DeveloperFilters {
  selectedCategories: string[];
  hourlyRateRange: [number, number];
  availableOnly: boolean;
  searchQuery: string;
  selectedSkills: string[];
  experienceLevel: string;
  location: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DeveloperSearchResult {
  developers: Developer[];
  filteredDevelopers: Developer[];
  filters: DeveloperFilters;
  pagination: PaginationState;
  updateFilter: <K extends keyof DeveloperFilters>(filterType: K, value: DeveloperFilters[K]) => void;
  isLoading: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
  refreshDevelopers: () => Promise<void>;
  setPage: (page: number) => void;
}
