
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
      // First attempt to login with our context function
      const loginSuccess = await login(email, password, userType);
      
      if (loginSuccess) {
        console.log('Login successful through context login function');
        toast.success('Login successful!');
        
        // Store in localStorage as backup
        localStorage.setItem('authState', JSON.stringify({
          isAuthenticated: true,
          userType: userType,
          // The user ID will be set by the auth context
        }));
        
        // Force page reload to ensure all auth state is refreshed
        // This is a last resort to ensure auth state is properly recognized
        setTimeout(() => {
          window.location.href = userType === 'developer' ? '/profile' : '/client-dashboard';
        }, 500);
        
        return;
      } else {
        console.error('Context login function returned false');
        setError('Login failed. Please check your credentials and try again.');
        toast.error('Login failed. Please check your credentials and try again.');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred during login');
      toast.error(error.message || 'Login failed. Please try again later.');
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
