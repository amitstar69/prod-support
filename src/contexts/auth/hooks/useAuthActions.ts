
import { Dispatch, SetStateAction, useCallback } from 'react';
import { AuthState } from '../types';
import { login as authLogin, LoginResult } from '../authLogin';
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
    userType: 'developer' | 'client'
  ): Promise<LoginResult> => {
    console.log('handleLogin called');
    setIsLoading(true);
    try {
      const result = await authLogin(
        email, 
        password, 
        userType, 
        false,
        setAuthState,
        null,
        null
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
  
  const handleRegister = useCallback(async (
    userData: any, 
    userType: 'developer' | 'client'
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
    handleRegister,
    handleLogout
  };
};
