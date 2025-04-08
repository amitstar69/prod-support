
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Code, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import EmailVerificationMessage from '../components/auth/EmailVerificationMessage';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useRegisterForm, UserType } from '../hooks/useRegisterForm';
import { useEffect } from 'react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const {
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
    handleSubmit
  } = useRegisterForm();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    if (location.state?.userType) {
      handleUserTypeChange(location.state.userType as UserType);
    }
  }, [location.state]);
  
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
                        onClick={() => handleUserTypeChange('client')}
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
                        onClick={() => handleUserTypeChange('developer')}
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
                          placeholder="example@domain.com"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Enter a valid email address with domain (e.g., example@domain.com)</p>
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
                      onCheckedChange={(checked) => handleTermsChange(checked as boolean)}
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
