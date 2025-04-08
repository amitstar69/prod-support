
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Code, ArrowRight, Upload, Mail } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import EmailVerificationMessage from '../components/auth/EmailVerificationMessage';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();
  
  const defaultUserType = location.state?.userType || 'client';
  const [userType, setUserType] = useState<'client' | 'developer'>(defaultUserType);
  
  const [isLoading, setIsLoading] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    if (location.state?.userType) {
      setUserType(location.state.userType);
    }
  }, [location.state]);
  
  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data, error }) => {
        console.log('Current auth status (RegisterPage):', { session: data.session, error });
      });
    } catch (error) {
      console.error('Error checking auth status in RegisterPage:', error);
    }
  }, []);
  
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
  };
  
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
  
  if (showVerification) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 text-center">
                <EmailVerificationMessage email={formValues.email} />
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-2 text-center">Create an Account</h1>
          <p className="text-center text-muted-foreground">Join our platform to find or provide developer services</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              {formError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="space-y-4 mb-4">
                    <h2 className="font-medium text-lg mb-2">I want to join as:</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                          userType === 'client' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/30'
                        } h-[120px]`}
                        onClick={() => setUserType('client')}
                      >
                        <User className={`h-8 w-8 mb-2 ${userType === 'client' ? 'text-primary' : ''}`} />
                        <div className="text-center">
                          <p className="font-medium">Client</p>
                          <p className="text-xs text-muted-foreground mt-1">I need help from developers</p>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                          userType === 'developer' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/30'
                        } h-[120px]`}
                        onClick={() => setUserType('developer')}
                      >
                        <Code className={`h-8 w-8 mb-2 ${userType === 'developer' ? 'text-primary' : ''}`} />
                        <div className="text-center">
                          <p className="font-medium">Developer</p>
                          <p className="text-xs text-muted-foreground mt-1">I want to offer my services</p>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/30">
                    <h2 className="font-medium text-lg mb-4">Account Information</h2>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name*</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            value={formValues.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name*</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            value={formValues.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address*</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formValues.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password*</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formValues.password}
                          onChange={handleInputChange}
                          required
                          minLength={6}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Password must be at least 6 characters</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password*</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formValues.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className={!passwordsMatch && formValues.confirmPassword ? 'border-destructive focus:border-destructive' : ''}
                        />
                        {!passwordsMatch && formValues.confirmPassword && (
                          <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id="terms" 
                      checked={termsAgreed}
                      onCheckedChange={(checked) => setTermsAgreed(checked as boolean)}
                      className="mt-1"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                      I agree to the <a href="#" className="text-primary font-medium">Terms of Service</a> and <a href="#" className="text-primary font-medium">Privacy Policy</a>
                    </Label>
                  </div>
                  
                  <div>
                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isLoading || !passwordsMatch}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating account...
                        </span>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
              
              <div className="mt-6 pt-6 border-t border-border/30 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-medium">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
