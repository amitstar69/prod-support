
// Import necessary types and utilities
import { supabase } from '../client';
import { Developer } from '../../../types/product';

export const fetchDeveloperById = async (
  developerId: string
): Promise<{ data: Developer | null; error: any }> => {
  try {
    console.log('[fetchDeveloperById] Fetching developer:', developerId);
    
    // Check if developer ID is provided
    if (!developerId) {
      console.error('[fetchDeveloperById] No developer ID provided');
      return {
        data: null,
        error: 'Developer ID is required'
      };
    }
    
    // Join the profiles and developer_profiles tables
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        image,
        description,
        location,
        languages,
        user_type,
        developer_profiles (
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
      console.error('[fetchDeveloperById] Error:', error);
      return { data: null, error };
    }
    
    if (!data) {
      console.error('[fetchDeveloperById] Developer not found');
      return { data: null, error: 'Developer not found' };
    }
    
    // Extract values from developer_profiles array if it exists
    let developerProfileData = {};
    if (data.developer_profiles && Array.isArray(data.developer_profiles) && data.developer_profiles.length > 0) {
      const profileData = data.developer_profiles[0];
      developerProfileData = {
        hourly_rate: profileData.hourly_rate,
        minute_rate: profileData.minute_rate,
        category: profileData.category,
        skills: profileData.skills || [],
        experience: profileData.experience,
        rating: profileData.rating,
        availability: profileData.availability,
        online: profileData.online,
        last_active: profileData.last_active,
        featured: profileData.featured,
        phone: profileData.phone,
        languages_spoken: profileData.languages_spoken || [],
        communication_preferences: profileData.communication_preferences || [],
        education: profileData.education || [],
        certifications: profileData.certifications || [],
        portfolio_items: profileData.portfolio_items || []
      };
    }
    
    // Combine the data from both tables
    const developer: Developer = {
      ...data,
      ...developerProfileData
    };
    
    // Remove the nested developer_profiles field
    delete developer.developer_profiles;
    
    console.log('[fetchDeveloperById] Developer found:', developer.name);
    
    return { data: developer, error: null };
  } catch (error) {
    console.error('[fetchDeveloperById] Exception:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
