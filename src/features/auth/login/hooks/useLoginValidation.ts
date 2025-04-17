
import { useState, useCallback } from 'react';

export type ValidationError = {
  email: string;
  password: string;
};

export interface LoginValidationResult {
  isValid: boolean;
  errors: ValidationError;
}

export const useLoginValidation = () => {
  const [errors, setErrors] = useState<ValidationError>({ email: '', password: '' });

  const validateEmail = useCallback((email: string): boolean => {
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  }, []);

  const validatePassword = useCallback((password: string): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    
    if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  }, []);

  const validateForm = useCallback((email: string, password: string): LoginValidationResult => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    return {
      isValid: isEmailValid && isPasswordValid,
      errors: {
        email: isEmailValid ? '' : errors.email,
        password: isPasswordValid ? '' : errors.password
      }
    };
  }, [validateEmail, validatePassword, errors]);

  const clearErrors = useCallback(() => {
    setErrors({ email: '', password: '' });
  }, []);

  const setFieldError = useCallback((field: keyof ValidationError, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  return {
    errors,
    validateEmail,
    validatePassword,
    validateForm,
    clearErrors,
    setFieldError
  };
};
