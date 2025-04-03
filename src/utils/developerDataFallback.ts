
import { supabase } from '../integrations/supabase/client';
import { Developer } from '../types/product';

export const createSampleDeveloperProfiles = async () => {
  // Only run this in development
  if (process.env.NODE_ENV !== 'development') {
    console.log('Skipping sample developer creation in production');
    return;
  }

  // Sample developer data
  const sampleDevelopers = [
    {
      name: 'Alex Johnson',
      email: 'dev_alex@example.com',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1600&auto=format&fit=crop',
      description: 'Frontend specialist with expertise in building responsive applications',
      category: 'frontend',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      experience: '5+ years in frontend development',
      hourly_rate: 85,
      minute_rate: 1.5,
      rating: 4.9,
      availability: true,
      online: true,
      location: 'New York, USA'
    },
    {
      name: 'Samantha Chen',
      email: 'dev_sam@example.com',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1600&auto=format&fit=crop',
      description: 'Backend engineer experienced in building scalable APIs and cloud architecture',
      category: 'backend',
      skills: ['Node.js', 'Python', 'AWS', 'PostgreSQL'],
      experience: '7+ years in backend development',
      hourly_rate: 95,
      minute_rate: 1.7,
      rating: 4.8,
      availability: true,
      online: false,
      location: 'San Francisco, USA'
    }
  ];
  
  console.log('Checking for existing developer profiles...');
  
  const { data: existingProfiles, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_type', 'developer');
    
  if (fetchError) {
    console.error('Error checking existing profiles:', fetchError);
    return;
  }
  
  if (existingProfiles && existingProfiles.length > 0) {
    console.log('Developer profiles already exist, skipping sample creation');
    console.log(`Found ${existingProfiles.length} existing developer profiles`);
    return;
  }
  
  console.log('No developer profiles found, creating samples...');
  
  // Create sample developers
  for (const dev of sampleDevelopers) {
    // 1. Create auth user (in real app) - skipped here
    // 2. Create profile record
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        name: dev.name,
        email: dev.email,
        image: dev.image,
        description: dev.description,
        location: dev.location,
        user_type: 'developer',
        profile_completed: true
      })
      .select()
      .single();
      
    if (profileError) {
      console.error('Error creating profile:', profileError);
      continue;
    }
    
    console.log('Created profile:', profileData);
    
    // 3. Create developer_profile record
    const { data: devProfileData, error: devProfileError } = await supabase
      .from('developer_profiles')
      .insert({
        id: profileData.id,
        category: dev.category,
        skills: dev.skills,
        experience: dev.experience,
        hourly_rate: dev.hourly_rate,
        minute_rate: dev.minute_rate,
        rating: dev.rating,
        availability: dev.availability,
        online: dev.online
      })
      .select();
      
    if (devProfileError) {
      console.error('Error creating developer profile:', devProfileError);
      continue;
    }
    
    console.log('Created developer profile:', devProfileData);
  }
  
  console.log('Sample developers created successfully');
};
