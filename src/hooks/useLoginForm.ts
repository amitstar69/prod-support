
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

export type UserType = 'client' | 'developer';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, userType } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userTypeState, setUserTypeState] = useState<UserType>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleUserTypeChange = (type: UserType) => setUserTypeState(type);
  const handleRememberMeChange = () => setRememberMe(!rememberMe);

  const checkAuthStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Current auth status (LoginPage):', { session: data.session, error });
      
      // If there's an active session, update local state
      if (data.session) {
        // Get user profile to confirm user type
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.session.user.id)
          .maybeSingle();
          
        // If we retrieved the profile, use that user type
        if (profileData) {
          console.log('Profile found with user type:', profileData.user_type);
          
          // Store in localStorage to ensure persistence
          localStorage.setItem('authState', JSON.stringify({
            isAuthenticated: true,
            userType: profileData.user_type,
            userId: data.session.user.id,
          }));
          
          // Wait a bit for state to update through context
          setTimeout(() => {
            if (!isAuthenticated) {
              console.log('Auth state not updated via context, forcing reload');
              window.location.reload(); // Force a reload if auth state hasn't updated
            }
          }, 1000);
        } else {
          console.log('No profile found for logged in user - unusual state');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }, [isAuthenticated]);

  // Check auth status immediately on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Redirect based on authentication state
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard', { userType });
      
      // Short delay to ensure state is fully updated
      setTimeout(() => {
        if (userType === 'developer') {
          navigate('/profile');
        } else {
          navigate('/client-dashboard');
        }
      }, 500);
    }
  }, [isAuthenticated, userType, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      toast.error('Please enter both email and password');
      return;
    }
    
    if (isLoading) {
      return; // Prevent double submission
    }
    
    setError('');
    setIsLoading(true);
    console.log(`Attempting to login: ${email} as ${userTypeState}`);
    
    try {
      // Direct Supabase login attempt for better error visibility
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Supabase login error:', error);
        setError(error.message);
        toast.error('Login failed: ' + error.message);
        setIsLoading(false);
        return;
      }
      
      if (!data.user) {
        console.error('No user data returned from Supabase');
        setError('Login failed: No user data returned');
        toast.error('Login failed: No user data returned');
        setIsLoading(false);
        return;
      }
      
      console.log('Supabase login successful, checking profile...');
      
      // Check if profile exists and matches user type
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Error retrieving user profile: ' + profileError.message);
        toast.error('Error retrieving user profile');
        setIsLoading(false);
        return;
      }
      
      // If no profile exists, create one
      if (!profileData) {
        console.log('No profile found, creating new profile');
        await createNewProfile(data.user.id);
      } else if (profileData.user_type !== userTypeState) {
        console.error(`User type mismatch: account is ${profileData.user_type}, tried to login as ${userTypeState}`);
        setError(`You registered as a ${profileData.user_type}, but tried to log in as a ${userTypeState}`);
        toast.error(`You registered as a ${profileData.user_type}, but tried to log in as a ${userTypeState}`);
        // Sign out the user since we logged in with the wrong type
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      } else {
        console.log(`Profile exists and matches selected user type: ${profileData.user_type}`);
      }
      
      // Set auth state manually to ensure it's updated
      const authState = {
        isAuthenticated: true,
        userType: userTypeState,
        userId: data.user.id,
      };
      
      localStorage.setItem('authState', JSON.stringify(authState));
      console.log('Auth state saved to localStorage:', authState);
      
      // Try to use context login as a formality to update global state
      const contextLoginSuccess = await login(email, password, userTypeState);
      console.log('Context login result:', contextLoginSuccess);
      
      toast.success('Login successful!');
      console.log(`Navigating to ${userTypeState === 'developer' ? '/profile' : '/client-dashboard'}...`);
      
      // Force reload the page to ensure all components get the updated auth state
      setTimeout(() => {
        window.location.href = userTypeState === 'developer' ? '/profile' : '/client-dashboard';
        setIsLoading(false);
      }, 500);
    } catch (error: any) {
      console.error('Login exception:', error);
      setError(error.message || 'An unexpected error occurred');
      toast.error(error.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  // Helper to create a new profile
  const createNewProfile = async (userId: string) => {
    try {
      // Create base profile
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          user_type: userTypeState,
          email: email,
          name: email.split('@')[0], // Use part of email as temporary name
          profile_completed: false
        });
        
      if (createError) {
        console.error('Error creating profile:', createError);
        throw createError;
      }
      
      // Create type-specific profile
      if (userTypeState === 'developer') {
        const { error: devProfileError } = await supabase
          .from('developer_profiles')
          .insert({
            id: userId,
            hourly_rate: 75,
            minute_rate: 1.25,
            skills: ['JavaScript', 'React'],
            availability: true
          });
          
        if (devProfileError) {
          console.error('Error creating developer profile:', devProfileError);
          // Continue anyway as the base profile was created
        }
      } else {
        const { error: clientProfileError } = await supabase
          .from('client_profiles')
          .insert({
            id: userId,
            budget_per_hour: 75,
            preferred_help_format: ['chat'],
            looking_for: ['web development']
          });
          
        if (clientProfileError) {
          console.error('Error creating client profile:', clientProfileError);
          // Continue anyway as the base profile was created
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in createNewProfile:', error);
      return false;
    }
  };

  return {
    email,
    password,
    userType: userTypeState,
    isLoading,
    error,
    rememberMe,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange,
    handleSubmit,
    checkAuthStatus,
    isAuthenticated
  };
};
