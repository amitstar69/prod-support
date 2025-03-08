
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Code } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { debugCheckProfileExists, debugCreateProfile } from '../contexts/auth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();
  
  const defaultUserType = location.state?.userType || 'client';
  const [userType, setUserType] = useState<'client' | 'developer'>(defaultUserType);
  
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      if (!firstName || !lastName || !email || !password) {
        toast.error('Please fill out all required fields');
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
        
        if (userType === 'developer') {
          navigate('/developer-registration');
        } else {
          navigate('/client-profile');
        }
      } else {
        toast.error('Registration failed. Please try with a different email.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed: ' + (error.message || 'Unknown error'));
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
                    <label className="block text-sm font-medium mb-2">
                      I want to:
                    </label>
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
                      <label htmlFor="firstName" className="block text-sm font-medium">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="lastName" className="block text-sm font-medium">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Password must be at least 6 characters</p>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="terms"
                        required
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                      />
                      <span className="text-sm">
                        I agree to the <a href="#" className="text-primary font-medium">Terms of Service</a> and <a href="#" className="text-primary font-medium">Privacy Policy</a>
                      </span>
                    </label>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="button-primary w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
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
