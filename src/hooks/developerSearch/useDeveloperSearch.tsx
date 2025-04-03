
import { useEffect, useState } from 'react';
import { Developer } from '../../types/product';
import { DeveloperFilters, DeveloperSearchResult } from './types';
import { applyFilters } from './filterUtils';
import { fetchDevelopers } from './fetchUtils';

/**
 * Hook for searching and filtering developers
 */
export const useDeveloperSearch = (initialFilters: DeveloperFilters): DeveloperSearchResult => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [filters, setFilters] = useState<DeveloperFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Fetch all developers from Supabase
  const refreshDevelopers = async () => {
    setIsLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await fetchDevelopers();
    
    if (fetchError) {
      setError(fetchError);
    } else {
      setDevelopers(data);
    }
    
    setIsLoading(false);
  };

  // Load more developers for pagination
  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Update a specific filter
  const updateFilter = <K extends keyof DeveloperFilters>(
    filterType: K, 
    value: DeveloperFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Fetch developers on initial load
  useEffect(() => {
    refreshDevelopers();
  }, []);

  // Apply filters whenever developers or filters change
  useEffect(() => {
    const { results, hasMore: moreResults } = applyFilters(developers, filters, page, pageSize);
    setFilteredDevelopers(results);
    setHasMore(moreResults);
  }, [developers, filters, page]);

  return {
    developers,
    filteredDevelopers,
    filters,
    updateFilter,
    isLoading,
    error,
    loadMore,
    hasMore,
    refreshDevelopers,
  };
};
