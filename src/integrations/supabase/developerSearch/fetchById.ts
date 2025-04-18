
import { supabase } from '../client';
import { Developer } from '../../../types/product';

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
