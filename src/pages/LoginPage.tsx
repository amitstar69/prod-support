
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoginHeader from '../components/login/LoginHeader';
import LoginForm from '../components/login/LoginForm';
import { useLoginForm } from '../hooks/useLoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    email, 
    password, 
    userType, 
    isLoading, 
    error, 
    rememberMe,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange,
    handleSubmit,
    checkAuthStatus,
    isAuthenticated
  } = useLoginForm();
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting to home');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <Layout>
      <LoginHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <LoginForm
            email={email}
            password={password}
            userType={userType}
            isLoading={isLoading}
            error={error}
            rememberMe={rememberMe}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
            onUserTypeChange={handleUserTypeChange}
            onRememberMeChange={handleRememberMeChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
