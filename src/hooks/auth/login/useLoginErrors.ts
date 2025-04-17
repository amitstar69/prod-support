
import { useState, useCallback } from 'react';

export type LoginErrorState = {
  error: string;
  emailError: string;
  passwordError: string;
};

export const useLoginErrors = () => {
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const clearAllErrors = useCallback(() => {
    setError('');
    setEmailError('');
    setPasswordError('');
  }, []);

  const setLoginError = useCallback((message: string) => {
    setError(message);
    setEmailError('');
    setPasswordError('');
  }, []);

  const setFieldError = useCallback((field: 'email' | 'password', message: string) => {
    setError('');
    if (field === 'email') {
      setEmailError(message);
      setPasswordError('');
    } else {
      setPasswordError(message);
      setEmailError('');
    }
  }, []);

  return {
    error,
    emailError,
    passwordError,
    clearAllErrors,
    setLoginError,
    setFieldError
  };
};
