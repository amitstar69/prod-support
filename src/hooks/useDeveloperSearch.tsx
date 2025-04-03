
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
      console.log("Fetching developers from Supabase...");
      
      // First fetch all developer profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, username, email, image, location, description, user_type')
        .eq('user_type', 'developer');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log(`Found ${profilesData?.length || 0} developer profiles`, profilesData);
      
      if (!profilesData || profilesData.length === 0) {
        setDevelopers([]);
        setIsLoading(false);
        return;
      }
      
      // Then for each profile, fetch their developer-specific profile data
      const developersWithDetails = await Promise.all(
        profilesData.map(async (dev) => {
          const { data: devDetails, error: devDetailsError } = await supabase
            .from('developer_profiles')
            .select('*')
            .eq('id', dev.id)
            .single();
          
          if (devDetailsError) {
            console.error(`Error fetching details for developer ${dev.id}:`, devDetailsError);
            // Instead of returning null, return basic profile with defaults
            return {
              id: dev.id,
              name: dev.name || 'Anonymous Developer',
              hourlyRate: 0,
              minuteRate: 0,
              image: dev.image || '/placeholder.svg',
              category: '',
              skills: [],
              experience: '',
              description: dev.description || '',
              rating: 4.5,
              availability: false,
              online: false,
              lastActive: 'Recently',
              featured: false,
              location: dev.location || 'Global',
              email: dev.email,
              username: dev.username,
            } as Developer;
          }
          
          console.log(`Developer details for ${dev.id}:`, devDetails);
          
          // Map the DB structure to our Developer type
          return {
            id: dev.id,
            name: dev.name || 'Anonymous Developer',
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
            email: dev.email,
            username: dev.username,
          } as Developer;
        })
      );
      
      console.log(`Successfully processed ${developersWithDetails.length} developer profiles`);
      console.log("Developers with details:", developersWithDetails);
      
      setDevelopers(developersWithDetails);
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
    
    console.log(`Applying filters to ${results.length} developers`);
    
    // Filter by search query
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(
        dev =>
          (dev.name && dev.name.toLowerCase().includes(lowercaseQuery)) ||
          (dev.description && dev.description.toLowerCase().includes(lowercaseQuery)) ||
          (dev.category && dev.category.toLowerCase().includes(lowercaseQuery)) ||
          (dev.skills && dev.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery)))
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
        dev.skills && selectedSkills.some(skill => dev.skills.includes(skill))
      );
    }
    
    // Filter by experience level
    if (experienceLevel && experienceLevel !== 'all') {
      // Simple experience mapping based on text values
      results = results.filter(dev => {
        if (!dev.experience) return experienceLevel === 'beginner';
        
        if (experienceLevel === 'beginner' && 
            (dev.experience.includes('1') || dev.experience.toLowerCase().includes('entry'))) {
          return true;
        } else if (experienceLevel === 'intermediate' && 
            (dev.experience.includes('2') || dev.experience.includes('3') || 
             dev.experience.includes('4') || dev.experience.toLowerCase().includes('mid'))) {
          return true;
        } else if (experienceLevel === 'expert' && 
            (dev.experience.includes('5+') || dev.experience.includes('6+') || 
             dev.experience.includes('7+') || dev.experience.includes('8+') ||
             dev.experience.includes('9+') || dev.experience.includes('10+') ||
             dev.experience.toLowerCase().includes('senior') || 
             dev.experience.toLowerCase().includes('expert'))) {
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
    
    console.log(`After applying filters: ${results.length} developers match criteria`);
    
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
