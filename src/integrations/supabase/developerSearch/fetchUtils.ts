
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
