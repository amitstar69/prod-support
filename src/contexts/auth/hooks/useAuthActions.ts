
import { Dispatch, SetStateAction, useCallback } from 'react';
import { AuthState, UserType, OAuthProvider } from '../types';
import { login as authLogin, LoginResult } from '../authLogin';
import { loginWithOAuth as authLoginWithOAuth } from '../authOAuth';
import { register as authRegister } from '../authRegister';
import { logoutUser } from '../authUtils';

export const useAuthActions = (
  setAuthState: Dispatch<SetStateAction<AuthState>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  const handleLogout = useCallback(async (): Promise<boolean> => {
    console.log("Logout triggered from AuthProvider");
    try {
      const result = await logoutUser();
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
      return result;
    } catch (error) {
      console.error("Error during logout:", error);
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
      return false;
    }
  }, [setAuthState]);
  
  const handleLogin = useCallback(async (
    email: string, 
    password: string, 
    userType: UserType,
    rememberMe: boolean = false
  ): Promise<LoginResult> => {
    console.log('handleLogin called');
    setIsLoading(true);
    try {
      const result = await authLogin(
        email, 
        password, 
        userType, 
        rememberMe
      );
      
      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          userType: userType,
        }));
        console.log(`Login successful as ${userType}, setting auth state`);
      } else {
        console.error('Login failed:', result.error);
      }
      
      return result;
    } catch (error: any) {
      console.error('Login exception:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during login'
      };
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [setAuthState, setIsLoading]);
  
  const handleOAuthLogin = useCallback(async (
    provider: OAuthProvider,
    userType: UserType
  ): Promise<LoginResult> => {
    console.log(`handleOAuthLogin called for ${provider} as ${userType}`);
    setIsLoading(true);
    try {
      const result = await authLoginWithOAuth(provider, userType);
      
      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          userType: userType,
        }));
        console.log(`OAuth login successful as ${userType}, setting auth state`);
      } else {
        console.error('OAuth login failed:', result.error);
      }
      
      return result;
    } catch (error: any) {
      console.error('OAuth login exception:', error);
      return {
        success: false,
        error: error.message || `An unexpected error occurred during ${provider} login`
      };
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [setAuthState, setIsLoading]);
  
  const handleRegister = useCallback(async (
    userData: any, 
    userType: UserType
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authRegister(
        userData, 
        userType,
        [],
        [],
        () => {},
        () => {},
        setAuthState
      );
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [setAuthState, setIsLoading]);

  return {
    handleLogin,
    handleOAuthLogin,
    handleRegister,
    handleLogout
  };
};
