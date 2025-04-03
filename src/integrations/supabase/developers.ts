
import { supabase } from './client';
import { Developer } from '../../types/product';

/**
 * Fetches developers with pagination using a JOIN query
 * 
 * @param page The page number to fetch (starting from 1)
 * @param pageSize Number of developers per page
 * @param filters Optional filtering parameters
 * @returns Promise with developers data and pagination info
 */
export const fetchDevelopersWithPagination = async (
  page: number = 1,
  pageSize: number = 12,
  filters?: {
    searchQuery?: string;
    categories?: string[];
    minHourlyRate?: number;
    maxHourlyRate?: number;
    availableOnly?: boolean;
    skills?: string[];
    experienceLevel?: string;
    location?: string;
  }
): Promise<{
  data: Developer[];
  totalCount: number;
  error: string | null;
}> => {
  try {
    const offset = (page - 1) * pageSize;
    
    // Start building the query - use correct foreign key referencing
    let query = supabase
      .from('profiles')
      .select(`
        id,
        name,
        username,
        email,
        image,
        location,
        description,
        user_type,
        developer_profiles!id (
          hourly_rate,
          minute_rate,
          category,
          skills,
          experience,
          rating,
          availability,
          online,
          featured,
          last_active
        )
      `, { count: 'exact' })
      .eq('user_type', 'developer');

    // Apply filters if provided
    if (filters) {
      if (filters.searchQuery) {
        const searchTerm = `%${filters.searchQuery.toLowerCase()}%`;
        query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
      }
      
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('developer_profiles.category', filters.categories);
      }
      
      if (filters.minHourlyRate !== undefined) {
        query = query.gte('developer_profiles.hourly_rate', filters.minHourlyRate);
      }
      
      if (filters.maxHourlyRate !== undefined) {
        query = query.lte('developer_profiles.hourly_rate', filters.maxHourlyRate);
      }
      
      if (filters.availableOnly) {
        query = query.eq('developer_profiles.availability', true);
      }
    }
    
    // Add pagination
    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching developers:', error);
      return { 
        data: [], 
        totalCount: 0, 
        error: `Failed to fetch developers: ${error.message}` 
      };
    }
    
    // Map the nested data structure to our Developer type
    const developers = data.map(profile => {
      const devProfile = profile.developer_profiles;
      
      return {
        id: profile.id,
        name: profile.name || 'Anonymous Developer',
        username: profile.username,
        email: profile.email,
        hourlyRate: devProfile?.hourly_rate || 0,
        minuteRate: devProfile?.minute_rate || 0,
        image: profile.image || '/placeholder.svg',
        category: devProfile?.category || '',
        skills: devProfile?.skills || [],
        experience: devProfile?.experience || '',
        description: profile.description || '',
        rating: devProfile?.rating || 4.5,
        availability: devProfile?.availability || false,
        online: devProfile?.online || false,
        lastActive: devProfile?.last_active ? new Date(devProfile.last_active).toLocaleString() : 'Recently',
        featured: devProfile?.featured || false,
        location: profile.location || 'Global',
      } as Developer;
    });
    
    return { 
      data: developers, 
      totalCount: count || 0, 
      error: null 
    };
  } catch (err) {
    console.error('Exception fetching developers:', err);
    return { 
      data: [], 
      totalCount: 0, 
      error: err instanceof Error ? err.message : 'An unexpected error occurred' 
    };
  }
};

/**
 * Fetches a single developer by ID
 */
export const fetchDeveloperById = async (developerId: string): Promise<{
  data: Developer | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        username,
        email,
        image,
        location,
        description,
        user_type,
        developer_profiles!id (
          hourly_rate,
          minute_rate,
          category,
          skills,
          experience,
          rating,
          availability,
          online,
          featured,
          last_active,
          communication_preferences,
          phone,
          languages_spoken,
          education,
          certifications,
          portfolio_items
        )
      `)
      .eq('id', developerId)
      .eq('user_type', 'developer')
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Developer not found' };
      }
      return { data: null, error: `Failed to fetch developer: ${error.message}` };
    }
    
    if (!data || !data.developer_profiles) {
      return { data: null, error: 'Developer profile not found' };
    }
    
    const devProfile = data.developer_profiles;
    
    const developer: Developer = {
      id: data.id,
      name: data.name || 'Anonymous Developer',
      username: data.username,
      email: data.email,
      hourlyRate: devProfile.hourly_rate || 0,
      minuteRate: devProfile.minute_rate || 0,
      image: data.image || '/placeholder.svg',
      category: devProfile.category || '',
      skills: Array.isArray(devProfile.skills) ? devProfile.skills : [],
      experience: devProfile.experience || '',
      description: data.description || '',
      rating: devProfile.rating || 4.5,
      availability: devProfile.availability || false,
      online: devProfile.online || false,
      lastActive: devProfile.last_active ? new Date(devProfile.last_active).toLocaleString() : 'Recently',
      featured: devProfile.featured || false,
      location: data.location || 'Global',
      phone: devProfile.phone,
      // Fix the type conversion issues by ensuring we always have arrays
      languagesSpoken: Array.isArray(devProfile.languages_spoken) ? devProfile.languages_spoken : [],
      communicationPreferences: Array.isArray(devProfile.communication_preferences) ? devProfile.communication_preferences : [],
      education: Array.isArray(devProfile.education) ? devProfile.education : [],
      certifications: Array.isArray(devProfile.certifications) ? devProfile.certifications : [],
      portfolioItems: Array.isArray(devProfile.portfolio_items) ? devProfile.portfolio_items : [],
    };
    
    return { data: developer, error: null };
  } catch (err) {
    console.error('Exception fetching developer:', err);
    return { 
      data: null, 
      error: err instanceof Error ? err.message : 'An unexpected error occurred'  
    };
  }
};

/**
 * Create a bridge to the fetchUtils file to maintain backward compatibility
 */
<lov-write file_path="src/integrations/supabase/developerSearch/fetchUtils.ts">
import { supabase } from '../client';
import { Developer } from '../../../types/product';

/**
 * Fetches all developers from Supabase
 */
export const fetchDevelopers = async (): Promise<{
  data: Developer[];
  error: string | null;
}> => {
  try {
    console.log("Fetching developers from Supabase...");
    
    // First fetch all developer profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, username, email, image, location, description, user_type')
      .eq('user_type', 'developer');
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return { data: [], error: profilesError.message };
    }
    
    console.log(`Found ${profilesData?.length || 0} developer profiles`, profilesData);
    
    if (!profilesData || profilesData.length === 0) {
      return { data: [], error: null };
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
    
    return { data: developersWithDetails, error: null };
  } catch (err) {
    console.error('Error fetching developers:', err);
    return { 
      data: [], 
      error: err instanceof Error ? err.message : 'Failed to load developers'
    };
  }
};
