
import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Developer } from '../types/product';

export interface DeveloperFilters {
  selectedCategories: string[];
  hourlyRateRange: [number, number];
  availableOnly: boolean;
  searchQuery: string;
  selectedSkills: string[];
  experienceLevel: string;
  location: string;
}

export const useDeveloperSearch = (initialFilters: DeveloperFilters) => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [filters, setFilters] = useState<DeveloperFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Fetch all developers from Supabase
  const fetchDevelopers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First fetch all developer profiles
      const { data: developersData, error: developersError } = await supabase
        .from('profiles')
        .select('id, name, username, email, image, location, description')
        .eq('user_type', 'developer')
        .eq('profile_completed', true);
      
      if (developersError) throw developersError;
      
      if (developersData) {
        // Then for each profile, fetch their developer-specific profile data
        const developersWithDetails = await Promise.all(
          developersData.map(async (dev) => {
            const { data: devDetails, error: devDetailsError } = await supabase
              .from('developer_profiles')
              .select('*')
              .eq('id', dev.id)
              .single();
            
            if (devDetailsError) {
              console.error('Error fetching developer details:', devDetailsError);
              return null;
            }
            
            // Map the DB structure to our Developer type
            return {
              id: dev.id,
              name: dev.name,
              hourlyRate: devDetails?.hourly_rate || 0,
              minuteRate: devDetails?.minute_rate || 0,
              image: dev.image || '/placeholder.svg',
              category: devDetails?.category || '',
              skills: devDetails?.skills || [],
              experience: devDetails?.experience || '',
              description: dev.description || '',
              rating: devDetails?.rating || 4.5,
              availability: devDetails?.availability || false,
              online: devDetails?.online || false,
              lastActive: devDetails?.last_active ? new Date(devDetails.last_active).toLocaleString() : 'Recently',
              featured: devDetails?.featured || false,
              location: dev.location || 'Global',
            } as Developer;
          })
        );
        
        // Filter out any null values (failed fetches)
        const validDevelopers = developersWithDetails.filter(
          (dev): dev is Developer => dev !== null
        );
        
        setDevelopers(validDevelopers);
      }
    } catch (err) {
      console.error('Error fetching developers:', err);
      setError('Failed to load developers. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to the developers
  const applyFilters = () => {
    const {
      selectedCategories,
      hourlyRateRange,
      availableOnly,
      searchQuery,
      selectedSkills,
      experienceLevel,
      location
    } = filters;

    let results = [...developers];
    
    // Filter by search query
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(
        dev =>
          dev.name.toLowerCase().includes(lowercaseQuery) ||
          (dev.description && dev.description.toLowerCase().includes(lowercaseQuery)) ||
          (dev.category && dev.category.toLowerCase().includes(lowercaseQuery)) ||
          dev.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Filter by category
    if (selectedCategories.length > 0) {
      results = results.filter(dev => selectedCategories.includes(dev.category));
    }
    
    // Filter by hourly rate range
    results = results.filter(
      dev => dev.hourlyRate >= hourlyRateRange[0] && dev.hourlyRate <= hourlyRateRange[1]
    );
    
    // Filter by availability
    if (availableOnly) {
      results = results.filter(dev => dev.availability);
    }
    
    // Filter by skills
    if (selectedSkills.length > 0) {
      results = results.filter(dev => 
        selectedSkills.some(skill => dev.skills.includes(skill))
      );
    }
    
    // Filter by experience level
    if (experienceLevel && experienceLevel !== 'all') {
      // Simple experience mapping based on text values
      results = results.filter(dev => {
        if (experienceLevel === 'beginner' && dev.experience.includes('1')) {
          return true;
        } else if (experienceLevel === 'intermediate' && 
          (dev.experience.includes('2') || dev.experience.includes('3') || dev.experience.includes('4'))) {
          return true;
        } else if (experienceLevel === 'expert' && 
          (dev.experience.includes('5+') || dev.experience.includes('6+') || 
           dev.experience.includes('7+') || dev.experience.includes('8+') ||
           dev.experience.includes('9+') || dev.experience.includes('10+'))) {
          return true;
        } else if (experienceLevel === 'all') {
          return true;
        }
        return false;
      });
    }
    
    // Filter by location
    if (location && location !== 'all') {
      results = results.filter(dev => 
        dev.location && dev.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Simulate pagination with "Load More" functionality
    const pagedResults = results.slice(0, page * pageSize);
    setHasMore(pagedResults.length < results.length);
    
    setFilteredDevelopers(pagedResults);
  };

  // Load more developers
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
    fetchDevelopers();
  }, []);

  // Apply filters whenever developers or filters change
  useEffect(() => {
    applyFilters();
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
    refreshDevelopers: fetchDevelopers,
  };
};
