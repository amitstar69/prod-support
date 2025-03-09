
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

export type UserType = 'client' | 'developer';

export const useLoginForm = () => {
  const { login, isAuthenticated, userType } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userTypeState, setUserTypeState] = useState<UserType>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleUserTypeChange = (type: UserType) => setUserTypeState(type);
  const handleRememberMeChange = () => setRememberMe(!rememberMe);

  const checkAuthStatus = useCallback(async () => {
    // Skip this as we now handle session checking in LoginPage.tsx
    return;
  }, []);

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
    console.log(`[useLoginForm] Attempting to login: ${email} as ${userTypeState}`);
    
    try {
      // Direct Supabase login attempt
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[useLoginForm] Supabase login error:', error);
        setError(error.message);
        toast.error('Login failed: ' + error.message);
        setIsLoading(false);
        return;
      }
      
      if (!data.user) {
        console.error('[useLoginForm] No user data returned from Supabase');
        setError('Login failed: No user data returned');
        toast.error('Login failed: No user data returned');
        setIsLoading(false);
        return;
      }
      
      console.log('[useLoginForm] Supabase login successful, checking profile...');
      
      // Check if profile exists and matches user type
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error('[useLoginForm] Error fetching profile:', profileError);
        setError('Error retrieving user profile: ' + profileError.message);
        toast.error('Error retrieving user profile');
        setIsLoading(false);
        return;
      }
      
      // If no profile exists, create one
      if (!profileData) {
        console.log('[useLoginForm] No profile found, creating new profile');
        const profileCreated = await createNewProfile(data.user.id);
        
        if (!profileCreated) {
          console.error('[useLoginForm] Failed to create profile');
          setError('Failed to create user profile');
          toast.error('Failed to create user profile');
          setIsLoading(false);
          return;
        }
      } else if (profileData.user_type !== userTypeState) {
        console.error(`[useLoginForm] User type mismatch: account is ${profileData.user_type}, tried to login as ${userTypeState}`);
        setError(`You registered as a ${profileData.user_type}, but tried to log in as a ${userTypeState}`);
        toast.error(`You registered as a ${profileData.user_type}, but tried to log in as a ${userTypeState}`);
        // Sign out the user since we logged in with the wrong type
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      } else {
        console.log(`[useLoginForm] Profile exists and matches selected user type: ${profileData.user_type}`);
      }
      
      // Set auth state manually to ensure it's updated
      const authState = {
        isAuthenticated: true,
        userType: userTypeState,
        userId: data.user.id,
      };
      
      localStorage.setItem('authState', JSON.stringify(authState));
      console.log('[useLoginForm] Auth state saved to localStorage:', authState);
      
      // Try to use context login as a formality to update global state
      try {
        await login(email, password, userTypeState);
      } catch (loginError) {
        console.warn('[useLoginForm] Context login failed, but Supabase auth was successful:', loginError);
        // Continue anyway since we have already authenticated with Supabase
      }
      
      toast.success('Login successful!');
      setLoginSuccess(true);
      
      // Set loading to false
      setIsLoading(false);
    } catch (error: any) {
      console.error('[useLoginForm] Login exception:', error);
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
        console.error('[useLoginForm] Error creating profile:', createError);
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
          console.error('[useLoginForm] Error creating developer profile:', devProfileError);
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
          console.error('[useLoginForm] Error creating client profile:', clientProfileError);
          // Continue anyway as the base profile was created
        }
      }
      
      return true;
    } catch (error) {
      console.error('[useLoginForm] Error in createNewProfile:', error);
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
    loginSuccess,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange,
    handleSubmit,
    checkAuthStatus,
    isAuthenticated
  };
};
