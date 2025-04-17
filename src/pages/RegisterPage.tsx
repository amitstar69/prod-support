
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import EmailVerificationMessage from '../components/auth/EmailVerificationMessage';
import { Button } from '../components/ui/button';
import { useRegisterForm } from '../hooks/useRegisterForm';
import UserTypeSelection from '../components/auth/UserTypeSelection';
import RegisterForm from '../components/auth/RegisterForm';

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
    handleSubmit,
    handleGoogleRegister,
    handleGithubRegister
  } = useRegisterForm();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    if (location.state?.userType) {
      handleUserTypeChange(location.state.userType);
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
              <UserTypeSelection 
                userType={userType} 
                onUserTypeChange={handleUserTypeChange} 
              />
              
              <RegisterForm 
                formValues={formValues}
                passwordsMatch={passwordsMatch}
                termsAgreed={termsAgreed}
                isLoading={isLoading}
                formError={formError}
                userType={userType}
                handleInputChange={handleInputChange}
                handleTermsChange={handleTermsChange}
                handleSubmit={handleSubmit}
                onGoogleRegister={handleGoogleRegister}
                onGithubRegister={handleGithubRegister}
              />
              
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
