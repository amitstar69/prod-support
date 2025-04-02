
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Code } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { debugCheckProfileExists, debugCreateProfile } from '../contexts/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';

const RegisterPage: React.FC = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();
  
  const defaultUserType = location.state?.userType || 'client';
  const [userType, setUserType] = useState<'client' | 'developer'>(defaultUserType);
  
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
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
      const form = e.currentTarget;
      const formData = new FormData(form);
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
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
      
      if (!termsAgreed) {
        const errorMsg = 'You must agree to the Terms of Service and Privacy Policy';
        setFormError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }
      
      let imageUrl = '/placeholder.svg';
      if (profileImage) {
        imageUrl = imagePreview || '/placeholder.svg';
      }
      
      console.log(`Registering as ${userType} with:`, {
        name: `${firstName} ${lastName}`,
        email,
        hasPassword: !!password,
        imageUrl
      });
      
      const userData = {
        name: `${firstName} ${lastName}`,
        email,
        password,
        image: imageUrl,
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
        toast.success('Account created successfully');
        
        const authData = JSON.parse(localStorage.getItem('authState') || '{}');
        if (authData.userId) {
          const profileCheck = await debugCheckProfileExists(authData.userId);
          console.log('Post-registration profile check:', profileCheck);
          
          if (!profileCheck.exists) {
            console.log('Profile does not exist after registration, attempting direct creation...');
            const directCreation = await debugCreateProfile(
              authData.userId, 
              userType, 
              email, 
              `${firstName} ${lastName}`
            );
            console.log('Direct profile creation result:', directCreation);
            
            if (directCreation.success) {
              toast.success('Profile created successfully via direct creation');
            } else {
              toast.error('Failed to create profile directly: ' + directCreation.error);
            }
          }
        }
        
        // Fix navigation paths to match route definitions in App.tsx
        if (userType === 'developer') {
          navigate('/developer'); // Change from '/developer-registration'
        } else {
          navigate('/client-profile');
        }
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
                  <div className="flex flex-col items-center space-y-2">
                    <div 
                      onClick={handleImageClick}
                      className="relative w-24 h-24 rounded-full border-2 border-primary/50 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-secondary"
                    >
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-primary/70 text-sm font-medium text-center">
                          <span className="block text-xs">Add Profile Photo</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <span className="text-xs text-muted-foreground">
                      Click to upload profile picture
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-4">
                    <Label className="block text-sm font-medium mb-2">
                      I want to:
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`p-4 border rounded-md flex flex-col items-center text-center transition-colors ${
                          userType === 'client' 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover:bg-secondary/50'
                        }`}
                        onClick={() => setUserType('client')}
                      >
                        <User className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">Find a Developer</span>
                        <span className="text-xs text-muted-foreground mt-1">Get technical help</span>
                      </button>
                      
                      <button
                        type="button"
                        className={`p-4 border rounded-md flex flex-col items-center text-center transition-colors ${
                          userType === 'developer' 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover:bg-secondary/50'
                        }`}
                        onClick={() => setUserType('developer')}
                      >
                        <Code className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">I am a Developer</span>
                        <span className="text-xs text-muted-foreground mt-1">Offer my services</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="firstName">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="lastName">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="email">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="password">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Password must be at least 6 characters</p>
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
                      className="button-primary w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating account...
                        </span>
                      ) : 'Create Account'}
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
