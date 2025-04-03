
import { Developer } from '../../types/product';

export interface DeveloperFilters {
  selectedCategories: string[];
  hourlyRateRange: [number, number];
  availableOnly: boolean;
  searchQuery: string;
  selectedSkills: string[];
  experienceLevel: string;
  location: string;
}

export interface DeveloperSearchResult {
  developers: Developer[];
  filteredDevelopers: Developer[];
  filters: DeveloperFilters;
  updateFilter: <K extends keyof DeveloperFilters>(filterType: K, value: DeveloperFilters[K]) => void;
  isLoading: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
  refreshDevelopers: () => Promise<void>;
}

// New types for better API response handling
export interface DeveloperSearchResponse {
  success: boolean;
  data?: Developer[];
  error?: string;
  metadata?: {
    total: number;
    hasMore: boolean;
  };
}

export interface FilterOptions {
  categories: string[];
  skills: string[];
  experienceLevels: string[];
  locations: string[];
  maxHourlyRate: number;
}
