
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/auth';
import { UserType, OAuthProvider } from '../contexts/auth/types';

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const { register, loginWithOAuth, isAuthenticated } = useAuth();
  const [userType, setUserType] = useState<UserType>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword') {
        setPasswordsMatch(value === formValues.password);
      } else {
        setPasswordsMatch(value === formValues.confirmPassword);
      }
    }
    
    // Clear form error when user starts typing again
    if (formError) {
      setFormError(null);
    }
  };
  
  const validateEmail = (email: string): boolean => {
    // Check for basic email format and require a domain extension (like .com, .org, etc.)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
  };
  
  const handleTermsChange = (checked: boolean) => {
    setTermsAgreed(checked);
  };

  const handleSocialRegister = async (provider: OAuthProvider) => {
    if (!termsAgreed) {
      const errorMsg = 'You must agree to the Terms of Service and Privacy Policy';
      setFormError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`Registering with ${provider} as ${userType}`);
      const result = await loginWithOAuth(provider, userType);
      
      if (result.success) {
        toast.success(`Account created with ${provider}! You'll be redirected shortly.`);
        setShowVerification(true);
      } else {
        const errorMsg = result.error || `Registration with ${provider} failed. Please try again.`;
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error(`${provider} registration error:`, error);
      const errorMsg = error.message || `Registration with ${provider} failed. Please try again.`;
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => handleSocialRegister('google');
  const handleGithubRegister = () => handleSocialRegister('github');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isLoading) {
      return; // Prevent double submission
    }
    
    // Reset form error
    setFormError(null);
    setIsLoading(true);
    
    try {
      const { firstName, lastName, email, password, confirmPassword } = formValues;
      
      // Validation
      if (!firstName || !lastName || !email || !password) {
        const errorMsg = 'Please fill out all required fields';
        setFormError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }
      
      // Validate email format
      if (!validateEmail(email)) {
        const errorMsg = 'Please enter a valid email address with a domain (e.g., example@domain.com)';
        setFormError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }
      
      if (password.length < 6) {
        const errorMsg = 'Password must be at least 6 characters';
        setFormError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        const errorMsg = 'Passwords do not match';
        setFormError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }
      
      if (!termsAgreed) {
        const errorMsg = 'You must agree to the Terms of Service and Privacy Policy';
        setFormError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }
      
      console.log(`Registering as ${userType} with:`, {
        name: `${firstName} ${lastName}`,
        email,
        hasPassword: !!password,
      });
      
      const userData = {
        name: `${firstName} ${lastName}`,
        email,
        password,
        image: '/placeholder.svg',
        profileCompleted: false,
        firstName,
        lastName,
        location: '',
        description: '',
        languages: [],
        preferredWorkingHours: '',
        username: `${firstName.toLowerCase()}${lastName.toLowerCase()}`
      };
      
      if (userType === 'developer') {
        Object.assign(userData, {
          category: 'frontend',
          skills: ['JavaScript', 'React'],
          hourlyRate: 75,
          minuteRate: 1.5,
          experience: '3+ years',
          availability: true,
          rating: 4.5,
          communicationPreferences: ['chat', 'video']
        });
      } else {
        Object.assign(userData, {
          lookingFor: ['web development'],
          preferredHelpFormat: ['chat'],
          techStack: ['React'],
          budgetPerHour: 75,
          paymentMethod: 'Stripe',
          communicationPreferences: ['chat'],
          profileCompletionPercentage: 30
        });
      }
      
      console.log('Submitting registration with data:', userData);
      const success = await register(userData, userType);
      console.log('Registration result:', success ? 'Success' : 'Failed');
      
      if (success) {
        toast.success('Account created successfully! Please verify your email.');
        setShowVerification(true);
      } else {
        const errorMsg = 'Registration failed. Please try with a different email.';
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMsg = error.message || 'Registration failed. Please try again.';
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    userType,
    isLoading,
    termsAgreed,
    formError,
    formValues,
    passwordsMatch,
    showVerification,
    setShowVerification,
    handleUserTypeChange,
    handleInputChange,
    handleTermsChange,
    handleSubmit,
    handleGoogleRegister,
    handleGithubRegister
  };
};
