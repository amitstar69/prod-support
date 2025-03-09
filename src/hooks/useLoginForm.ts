
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

export type UserType = 'client' | 'developer';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleUserTypeChange = (type: UserType) => setUserType(type);
  const handleRememberMeChange = () => setRememberMe(!rememberMe);

  const checkAuthStatus = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Current auth status (LoginPage):', { session: data.session, error });
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

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
    console.log(`Attempting to login: ${email} as ${userType}`);
    
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
        // Still try to use the auth context login as fallback
        await attemptContextLogin();
        return;
      }
      
      // If no profile exists, create one
      if (!profileData) {
        console.log('No profile found, creating new profile');
        await createNewProfile(data.user.id);
      } else if (profileData.user_type !== userType) {
        console.error(`User type mismatch: account is ${profileData.user_type}, tried to login as ${userType}`);
        setError(`You registered as a ${profileData.user_type}, but tried to log in as a ${userType}`);
        toast.error(`You registered as a ${profileData.user_type}, but tried to log in as a ${userType}`);
        // Sign out the user since we logged in with the wrong type
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }
      
      // Set auth state manually to ensure it's updated
      localStorage.setItem('authState', JSON.stringify({
        isAuthenticated: true,
        userType: userType,
        userId: data.user.id,
      }));
      
      // Try to use context login as a formality to update global state
      const contextLoginSuccess = await login(email, password, userType);
      console.log('Context login result:', contextLoginSuccess);
      
      // Force a reload to ensure auth state is fully updated
      toast.success('Login successful!');
      console.log(`Navigating to ${userType === 'developer' ? '/profile' : '/client-dashboard'}...`);
      
      // Short delay to allow state updates to complete
      setTimeout(() => {
        if (userType === 'developer') {
          navigate('/profile');
        } else {
          navigate('/client-dashboard');
        }
      }, 300);
    } catch (error: any) {
      console.error('Login exception:', error);
      setError(error.message || 'An unexpected error occurred');
      toast.error(error.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  // Helper to attempt login via context
  const attemptContextLogin = async () => {
    try {
      const loginSuccess = await login(email, password, userType);
      
      if (loginSuccess) {
        console.log('Login successful through context login function');
        toast.success('Login successful!');
        
        if (userType === 'developer') {
          navigate('/profile');
        } else {
          navigate('/client-dashboard');
        }
        return true;
      } else {
        console.error('Context login function returned false');
        setError('Login failed. Please check your credentials and try again.');
        toast.error('Login failed. Please check your credentials and try again.');
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error('Context login error:', error);
      setError(error.message || 'An unexpected error occurred during login');
      toast.error(error.message || 'An unexpected error occurred during login');
      setIsLoading(false);
      return false;
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
          user_type: userType,
          email: email,
          name: email.split('@')[0], // Use part of email as temporary name
          profile_completed: false
        });
        
      if (createError) {
        console.error('Error creating profile:', createError);
        throw createError;
      }
      
      // Create type-specific profile
      if (userType === 'developer') {
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
    userType,
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
