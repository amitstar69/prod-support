
import { supabase, debugCheckProfileExists } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { Developer, Client } from '../../types/product';
import { Dispatch, SetStateAction } from 'react';
import { AuthState } from '../../types/product';

// Register function 
export const register = async (
  userData: Partial<Developer | Client>, 
  userType: 'developer' | 'client',
  mockDevelopers: Developer[],
  mockClients: Client[],
  setMockDevelopers: Dispatch<SetStateAction<Developer[]>>,
  setMockClients: Dispatch<SetStateAction<Client[]>>,
  setAuthState: Dispatch<SetStateAction<AuthState>>
): Promise<boolean> => {
  // Try Supabase registration first
  if (supabase) {
    try {
      if (!userData.email || !userData.password) {
        console.error('Registration failed: Email and password are required');
        toast.error('Registration failed: Email and password are required');
        return false;
      }
      
      console.log('Registering with Supabase', {
        email: userData.email,
        userType,
        name: userData.name,
        hasPassword: !!userData.password
      });
      
      // Extract firstName and lastName for metadata
      const firstName = (userData as any).firstName || '';
      const lastName = (userData as any).lastName || '';
      
      // First create auth user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            user_type: userType,
            name: userData.name,
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      console.log('Supabase signUp response:', { data, error });
      
      if (error) {
        console.error('Supabase registration error:', error);
        toast.error('Registration failed: ' + error.message);
        // Fallback to localStorage registration
        return registerWithLocalStorage(userData, userType, mockDevelopers, mockClients, setMockDevelopers, setMockClients, setAuthState);
      }
      
      if (!data.user) {
        console.error('No user data returned from Supabase');
        toast.error('Registration failed: No user data returned');
        return false;
      }
      
      console.log('User created in Auth system with ID:', data.user.id);
      
      // Need to wait a bit for auth to fully process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now explicitly create the profile record with try/catch for each step
      try {
        const profileData = {
          id: data.user.id,
          user_type: userType,
          name: userData.name || '',
          email: userData.email,
          image: userData.image || '/placeholder.svg',
          description: userData.description || '',
          location: userData.location || '',
          joined_date: new Date().toISOString(),
          languages: userData.languages || [],
          preferred_working_hours: userData.preferredWorkingHours || '',
          profile_completed: userData.profileCompleted || false,
          username: (userData as any).username || `user_${Date.now()}`,
        };
        
        console.log('Creating profile record with data:', profileData);
        
        // Insert profile with proper error handling
        const { error: profileError, data: profileInsertData } = await supabase
          .from('profiles')
          .insert([profileData])
          .select();
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('Error creating profile: ' + profileError.message);
          
          // Attempt direct insert with more debugging
          console.log('Attempting alternative profile creation approach...');
          const { error: altProfileError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              user_type: userType,
              name: userData.name || 'User',
              email: userData.email
            }]);
            
          if (altProfileError) {
            console.error('Alternative profile creation also failed:', altProfileError);
            return false;
          }
        } else {
          console.log('Profile created successfully:', profileInsertData);
        }
        
        // Create type-specific profile record
        if (userType === 'developer') {
          try {
            const devData = userData as Partial<Developer>;
            const developerProfileData = {
              id: data.user.id,
              hourly_rate: devData.hourlyRate || 75,
              minute_rate: devData.minuteRate || 1.5,
              category: devData.category || 'frontend',
              skills: devData.skills || ['JavaScript', 'React'],
              experience: devData.experience || '3+ years',
              rating: devData.rating || 4.5,
              availability: devData.availability !== undefined ? devData.availability : true,
              featured: devData.featured || false,
              online: devData.online || false,
              last_active: new Date().toISOString(),
              phone: devData.phone || null,
              communication_preferences: devData.communicationPreferences || ['chat', 'video'],
            };
            
            console.log('Creating developer profile with data:', developerProfileData);
            
            const { error: devProfileError, data: devProfileData } = await supabase
              .from('developer_profiles')
              .insert([developerProfileData])
              .select();
            
            if (devProfileError) {
              console.error('Error creating developer profile:', devProfileError);
              toast.error('Error creating developer profile: ' + devProfileError.message);
              // Try simplified insertion
              const { error: simpleDevProfileError } = await supabase
                .from('developer_profiles')
                .insert([{ id: data.user.id }]);
                
              if (simpleDevProfileError) {
                console.error('Simple developer profile insertion also failed:', simpleDevProfileError);
              }
            } else {
              console.log('Developer profile created successfully:', devProfileData);
            }
          } catch (devProfileError) {
            console.error('Exception during developer profile creation:', devProfileError);
          }
        } else {
          try {
            const clientData = userData as Partial<Client>;
            const clientProfileData = {
              id: data.user.id,
              looking_for: clientData.lookingFor || ['web development'],
              completed_projects: clientData.completedProjects || 0,
              profile_completion_percentage: clientData.profileCompletionPercentage || 0,
              preferred_help_format: clientData.preferredHelpFormat || ['chat'],
              budget: clientData.budget || null,
              payment_method: clientData.paymentMethod || 'Stripe',
              bio: clientData.bio || null,
              tech_stack: clientData.techStack || ['React'],
              budget_per_hour: clientData.budgetPerHour || 75,
              company: clientData.company || null,
              position: clientData.position || null,
              project_types: clientData.projectTypes || [],
              industry: clientData.industry || null,
              social_links: clientData.socialLinks || {},
              time_zone: clientData.timeZone || null,
              availability: clientData.availability || {},
              communication_preferences: clientData.communicationPreferences || ['chat'],
            };
            
            console.log('Creating client profile with data:', clientProfileData);
            
            const { error: clientProfileError, data: clientProfileInsertData } = await supabase
              .from('client_profiles')
              .insert([clientProfileData])
              .select();
            
            if (clientProfileError) {
              console.error('Error creating client profile:', clientProfileError);
              toast.error('Error creating client profile: ' + clientProfileError.message);
              // Try simplified insertion
              const { error: simpleClientProfileError } = await supabase
                .from('client_profiles')
                .insert([{ id: data.user.id }]);
                
              if (simpleClientProfileError) {
                console.error('Simple client profile insertion also failed:', simpleClientProfileError);
              }
            } else {
              console.log('Client profile created successfully:', clientProfileInsertData);
            }
          } catch (clientProfileError) {
            console.error('Exception during client profile creation:', clientProfileError);
          }
        }
      } catch (profileInsertError) {
        console.error('Exception during profile creation:', profileInsertError);
        toast.error('Failed to create profile due to an unexpected error');
      }
      
      // Set the authentication state after profile creation attempts
      setAuthState({
        isAuthenticated: true,
        userType,
        userId: data.user.id,
      });
      
      localStorage.setItem('authState', JSON.stringify({
        isAuthenticated: true,
        userType,
        userId: data.user.id,
      }));
      
      console.log('Registration completed successfully');
      
      // Verify profile creation with our debug function
      const profileCheck = await debugCheckProfileExists(data.user.id);
      console.log('Profile creation verification:', profileCheck);
      
      return true;
    } catch (error) {
      console.error('Supabase registration exception:', error);
      toast.error('Registration failed with an unexpected error. Please try again.');
      // Fallback to localStorage registration
      return registerWithLocalStorage(userData, userType, mockDevelopers, mockClients, setMockDevelopers, setMockClients, setAuthState);
    }
  } else {
    console.warn('No Supabase client available, falling back to localStorage registration');
    return registerWithLocalStorage(userData, userType, mockDevelopers, mockClients, setMockDevelopers, setMockClients, setAuthState);
  }
};

// Helper for localStorage registration
const registerWithLocalStorage = (
  userData: Partial<Developer | Client>, 
  userType: 'developer' | 'client',
  mockDevelopers: Developer[],
  mockClients: Client[],
  setMockDevelopers: Dispatch<SetStateAction<Developer[]>>,
  setMockClients: Dispatch<SetStateAction<Client[]>>,
  setAuthState: Dispatch<SetStateAction<AuthState>>
): boolean => {
  if (userType === 'developer') {
    const developerData = userData as Partial<Developer>;
    
    const newDev = {
      id: `dev-${Date.now()}`,
      name: developerData.name || '',
      hourlyRate: 75,
      image: '/placeholder.svg',
      category: developerData.category || 'frontend',
      skills: developerData.skills || ['JavaScript', 'React'],
      experience: developerData.experience || '3 years',
      description: developerData.description || '',
      rating: 4.5,
      availability: true,
      email: developerData.email,
      ...developerData,
    } as Developer;
    
    const updatedDevelopers = [...mockDevelopers, newDev];
    setMockDevelopers(updatedDevelopers);
    localStorage.setItem('mockDevelopers', JSON.stringify(updatedDevelopers));
    
    setAuthState({
      isAuthenticated: true,
      userType: 'developer',
      userId: newDev.id,
    });
    
    localStorage.setItem('authState', JSON.stringify({
      isAuthenticated: true,
      userType: 'developer',
      userId: newDev.id,
    }));
    
    return true;
  } else {
    const clientData = userData as Partial<Client>;
    
    const newClient = {
      id: `client-${Date.now()}`,
      name: clientData.name || '',
      email: clientData.email || '',
      joinedDate: new Date().toISOString(),
      ...clientData,
    } as Client;
    
    const updatedClients = [...mockClients, newClient];
    setMockClients(updatedClients);
    localStorage.setItem('mockClients', JSON.stringify(updatedClients));
    
    setAuthState({
      isAuthenticated: true,
      userType: 'client',
      userId: newClient.id,
    });
    
    localStorage.setItem('authState', JSON.stringify({
      isAuthenticated: true,
      userType: 'client',
      userId: newClient.id,
    }));
    
    return true;
  }
};
