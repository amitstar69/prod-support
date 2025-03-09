
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
      // Call supabase directly for more reliable login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Supabase login error:', error);
        setError(error.message);
        toast.error(error.message || 'Login failed');
        setIsLoading(false);
        return;
      }
      
      if (!data.user) {
        console.error('No user data returned from Supabase');
        setError('Login failed. No user data returned.');
        toast.error('Login failed. Please try again.');
        setIsLoading(false);
        return;
      }
      
      console.log('Supabase login successful, checking profile for user type match');
      
      // Get user profile to ensure user type matches
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Error retrieving user profile');
        toast.error('Error retrieving user profile');
        setIsLoading(false);
        return;
      }
      
      // Check if profile exists and if user type matches
      if (profileData) {
        if (profileData.user_type !== userType) {
          console.error('User type mismatch', { expected: userType, found: profileData.user_type });
          setError(`You registered as a ${profileData.user_type}, but tried to log in as a ${userType}.`);
          toast.error(`You registered as a ${profileData.user_type}, but tried to log in as a ${userType}.`);
          
          // Sign out to clear the session
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }
        
        console.log('User type matches, login successful');
        toast.success('Login successful!');
        navigate(userType === 'developer' ? '/profile' : '/client-dashboard');
      } else {
        console.log('No profile found, creating one');
        
        // Create a new profile for this user
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            user_type: userType,
            email: email,
            name: email.split('@')[0] // Use part of email as temporary name
          });
        
        if (createError) {
          console.error('Error creating profile:', createError);
          setError('Could not create user profile');
          toast.error('Could not create user profile');
          
          // Sign out to clear the session
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }
        
        // Create type-specific profile
        if (userType === 'developer') {
          await supabase
            .from('developer_profiles')
            .insert({
              id: data.user.id,
              hourly_rate: 75,
              minute_rate: 1.25,
              skills: ['JavaScript', 'React'],
              availability: true
            });
        } else {
          await supabase
            .from('client_profiles')
            .insert({
              id: data.user.id,
              budget_per_hour: 75,
              preferred_help_format: ['chat'],
              looking_for: ['web development']
            });
        }
        
        console.log('Profile created, login successful');
        toast.success('Welcome! Your profile has been created.');
        navigate(userType === 'developer' ? '/profile' : '/client-dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred during login');
      toast.error(error.message || 'Login failed. Please try again later.');
    } finally {
      setIsLoading(false);
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
