
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [userType, setUserType] = useState<'client' | 'developer'>('client');
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const userData = {
      name: `${firstName} ${lastName}`,
      email,
      password
    };
    
    try {
      const success = await register(userData, userType);
      
      if (success) {
        toast.success('Account created successfully');
        
        if (userType === 'developer') {
          // If registering as a developer, redirect to complete the profile
          navigate('/developer-registration');
        } else {
          // If registering as a client, redirect to client profile
          navigate('/client-profile');
        }
      } else {
        toast.error('Registration failed. Please try with a different email.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span className="text-sm font-medium">Offer Services</span>
                        <span className="text-xs text-muted-foreground mt-1">Share your expertise</span>
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
                    />
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
