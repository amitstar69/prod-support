import { useEffect, useState, useCallback } from 'react';
import { Developer } from '../../types/product';
import { DeveloperFilters, DeveloperSearchResult, PaginationState } from './types';
import { fetchDevelopersWithPagination } from '../../integrations/supabase/developers';
import { toast } from 'sonner';
import { createSampleDeveloperProfiles } from '../../utils/developerDataFallback';

/**
 * Hook for searching and filtering developers with pagination
 */
export const useDeveloperSearch = (initialFilters: DeveloperFilters): DeveloperSearchResult => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [filters, setFilters] = useState<DeveloperFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFallback, setHasAttemptedFallback] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0
  });

  // Derived state
  const hasMore = pagination.page < pagination.totalPages;

  // Convert filters format for the API
  const prepareFiltersForApi = () => {
    return {
      searchQuery: filters.searchQuery,
      categories: filters.selectedCategories.length > 0 ? filters.selectedCategories : undefined,
      minHourlyRate: filters.hourlyRateRange[0] > 0 ? filters.hourlyRateRange[0] : undefined,
      maxHourlyRate: filters.hourlyRateRange[1] < 200 ? filters.hourlyRateRange[1] : undefined,
      availableOnly: filters.availableOnly || undefined,
      // We'll handle skills filtering on the client for now since it requires array intersection
      experienceLevel: filters.experienceLevel !== 'all' ? filters.experienceLevel : undefined,
      location: filters.location !== 'all' ? filters.location : undefined
    };
  };

  // Fetch developers from the API with pagination
  const fetchDevelopers = useCallback(async (page = pagination.page) => {
    setIsLoading(true);
    setError(null);
    
    const apiFilters = prepareFiltersForApi();
    
    const { data, totalCount, error: fetchError } = await fetchDevelopersWithPagination(
      page,
      pagination.pageSize,
      apiFilters
    );
    
    if (fetchError) {
      console.error('Error fetching developers:', fetchError);
      setError(fetchError);
      
      // Try to recover gracefully
      if (!hasAttemptedFallback && data.length === 0) {
        setHasAttemptedFallback(true);
        try {
          console.log('Attempting to create fallback developer profiles...');
          await createSampleDeveloperProfiles();
          toast.success('Created sample developer profiles for testing');
          // Retry fetch after creating fallbacks
          fetchDevelopers(page);
          return;
        } catch (err) {
          console.error('Failed to create fallback profiles:', err);
          toast.error('Could not create sample profiles');
        }
      }
    } else {
      // If we're on the first page, replace developers
      // Otherwise append to existing developers for "load more" functionality
      if (page === 1) {
        setDevelopers(data);
        setFilteredDevelopers(data);
      } else {
        setDevelopers(prev => [...prev, ...data]);
        setFilteredDevelopers(prev => [...prev, ...data]);
      }
      
      // Update pagination state
      const totalPages = Math.ceil(totalCount / pagination.pageSize);
      setPagination(prev => ({
        ...prev,
        page,
        totalCount,
        totalPages
      }));
    }
    
    setIsLoading(false);
  }, [filters, pagination.pageSize, hasAttemptedFallback]);

  // Load the next page of developers
  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchDevelopers(pagination.page + 1);
    }
  };

  // Set a specific page
  const setPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.page) {
      fetchDevelopers(page);
    }
  };

  // Update a specific filter
  const updateFilter = useCallback(<K extends keyof DeveloperFilters>(
    filterType: K, 
    value: DeveloperFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // Reset to page 1 when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  }, []);

  // Client-side filtering for skills since it's hard to do efficiently on the server
  useEffect(() => {
    if (filters.selectedSkills.length > 0) {
      const filtered = developers.filter(dev => 
        dev.skills && filters.selectedSkills.some(skill => dev.skills.includes(skill))
      );
      setFilteredDevelopers(filtered);
    } else {
      setFilteredDevelopers(developers);
    }
  }, [developers, filters.selectedSkills]);

  // Refresh developers when filters change
  useEffect(() => {
    // Avoid multiple API calls when both filters and pagination change simultaneously
    const timeoutId = setTimeout(() => {
      fetchDevelopers(1); // Reset to page 1 when filters change
    }, 300); // Debounce filter changes
    
    return () => clearTimeout(timeoutId);
  }, [
    filters.searchQuery, 
    filters.selectedCategories, 
    filters.hourlyRateRange, 
    filters.availableOnly,
    filters.experienceLevel,
    filters.location,
    fetchDevelopers
  ]);

  // Provide a refresh method for manual refresh
  const refreshDevelopers = async () => {
    await fetchDevelopers(1);
  };

  return {
    developers,
    filteredDevelopers,
    filters,
    pagination,
    updateFilter,
    isLoading,
    error,
    loadMore,
    hasMore,
    refreshDevelopers,
    setPage
  };
};
