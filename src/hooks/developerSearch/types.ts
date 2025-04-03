
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
