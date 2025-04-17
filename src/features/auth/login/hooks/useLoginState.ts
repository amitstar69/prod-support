
import { useState, useCallback } from 'react';
import { UserType } from '@/contexts/auth/types';

export const useLoginState = (initialUserType: UserType = 'client') => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>(initialUserType);
  const [rememberMe, setRememberMe] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setGeneralError('');
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setGeneralError('');
  }, []);

  const handleUserTypeChange = useCallback((type: UserType) => {
    setUserType(type);
    setGeneralError('');
  }, []);

  const handleRememberMeChange = useCallback(() => {
    setRememberMe(prev => !prev);
  }, []);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setGeneralError('');
  }, []);

  return {
    email,
    password,
    userType,
    rememberMe,
    generalError,
    setGeneralError,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange,
    resetForm
  };
};
