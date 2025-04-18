
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';

import Index from './pages/Index';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import DeveloperProfilePage from './pages/DeveloperProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import ClientProfile from './pages/ClientProfile';
import ClientOnboarding from './pages/onboarding/ClientOnboarding';
import DeveloperOnboarding from './pages/onboarding/DeveloperOnboarding';
import GetHelpPage from './pages/GetHelpPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFound from './pages/NotFound';
import DeveloperDashboard from './pages/DeveloperDashboard';
import DeveloperWelcomePage from './pages/DeveloperWelcomePage';
import ClientDashboard from './pages/ClientDashboard';
import ClientLanding from './pages/ClientLanding';
import DeveloperRegistration from './pages/DeveloperRegistration';
import SessionHistory from './pages/SessionHistory';
import DeveloperTicketDetail from './pages/DeveloperTicketDetail';
import MyApplicationsPage from './pages/MyApplicationsPage';
import VerificationSuccessPage from './pages/VerificationSuccessPage';
import VerificationCanceledPage from './pages/VerificationCanceledPage';

import { AuthProvider, useAuth } from './contexts/auth';
import { HelpRequestProvider } from './contexts/HelpRequestContext';
import { getUserHomePage } from './utils/navigationUtils';

import './App.css';

function App() {
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <HelpRequestProvider>
        <BrowserRouter>
          <Routes>
            {/* Public marketing page for all users */}
            <Route path="/" element={<Index />} />
            
            {/* Authentication routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verification-success" element={<VerificationSuccessPage />} />
            <Route path="/verification-canceled" element={<VerificationCanceledPage />} />
            
            {/* Public search and profile routes */}
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/developer-profiles/:id" element={<DeveloperProfilePage />} />
            
            {/* SEO-friendly developer routes */}
            <Route path="/developer" element={
              <ProtectedRoute requiredUserType="developer">
                <DeveloperWelcomePage />
              </ProtectedRoute>
            } />
            
            <Route path="/developer/dashboard" element={
              <ProtectedRoute requiredUserType="developer">
                <DeveloperDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/developer/tickets" element={
              <ProtectedRoute requiredUserType="developer">
                <DeveloperDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/developer/profile" element={
              <ProtectedRoute requiredUserType="developer">
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/developer/applications" element={
              <ProtectedRoute requiredUserType="developer">
                <MyApplicationsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/developer/tickets/:ticketId" element={
              <ProtectedRoute requiredUserType="developer">
                <DeveloperTicketDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/developer/onboarding" element={
              <ProtectedRoute requiredUserType="developer">
                <DeveloperOnboarding />
              </ProtectedRoute>
            } />
            
            <Route path="/developer/sessions" element={
              <ProtectedRoute requiredUserType="developer">
                <SessionHistory />
              </ProtectedRoute>
            } />
            
            {/* SEO-friendly client routes */}
            <Route path="/client" element={
              <ProtectedRoute requiredUserType="client">
                <ClientLanding />
              </ProtectedRoute>
            } />
            
            <Route path="/client/dashboard" element={
              <ProtectedRoute requiredUserType="client">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/client/tickets" element={
              <ProtectedRoute requiredUserType="client">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/client/profile" element={
              <ProtectedRoute requiredUserType="client">
                <ClientProfile />
              </ProtectedRoute>
            } />
            
            <Route path="/client/onboarding" element={
              <ProtectedRoute requiredUserType="client">
                <ClientOnboarding />
              </ProtectedRoute>
            } />
            
            <Route path="/client/sessions" element={
              <ProtectedRoute requiredUserType="client">
                <SessionHistory />
              </ProtectedRoute>
            } />
            
            <Route path="/client/help" element={
              <ProtectedRoute requiredUserType="client">
                <GetHelpPage />
              </ProtectedRoute>
            } />
            
            {/* Routes accessible by both user types */}
            <Route path="/get-help/*" element={
              <ProtectedRoute>
                <GetHelpPage />
              </ProtectedRoute>
            } />
            
            <Route path="/session-history" element={
              <ProtectedRoute>
                <SessionHistory />
              </ProtectedRoute>
            } />
            
            {/* Account registration */}
            <Route path="/developer-registration" element={<DeveloperRegistration />} />
            
            {/* Automatic routing based on user type */}
            <Route path="/dashboard" element={<UserTypeRedirect />} />
            <Route path="/home" element={<UserTypeRedirect />} />
            <Route path="/account" element={<UserAccountRedirect />} />
            
            {/* Legacy route redirects for backward compatibility */}
            <Route path="/developer-dashboard" element={<Navigate to="/developer/dashboard" replace />} />
            <Route path="/client-dashboard" element={<Navigate to="/client/dashboard" replace />} />
            <Route path="/ticket-dashboard" element={<Navigate to="/client/tickets" replace />} />
            <Route path="/onboarding/developer" element={<Navigate to="/developer/onboarding" replace />} />
            <Route path="/onboarding/client" element={<Navigate to="/client/onboarding" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </HelpRequestProvider>
    </AuthProvider>
  );
}

// Component to handle redirection to the user's home page
const UserTypeRedirect = () => {
  const { userType, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const homePath = getUserHomePage(userType);
  return <Navigate to={homePath} replace />;
};

// Component to handle redirection to the user's profile page
const UserAccountRedirect = () => {
  const { userType, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const profilePath = userType === 'developer' ? '/developer/profile' : '/client/profile';
  return <Navigate to={profilePath} replace />;
};

export default App;
