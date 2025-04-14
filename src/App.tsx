
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

import './App.css';

function App() {
  // Check if dark mode is enabled
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
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/developer" element={<DeveloperRegistration />} />
            <Route path="/developer-registration" element={<DeveloperRegistration />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/developer/:id" element={<DeveloperProfilePage />} />
            <Route path="/verification-success" element={<VerificationSuccessPage />} />
            <Route path="/verification-canceled" element={<VerificationCanceledPage />} />
            
            {/* Developer-specific routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requiredUserType="developer">
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/developer-dashboard" 
              element={
                <ProtectedRoute requiredUserType="developer">
                  <DeveloperWelcomePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/developer-tickets" 
              element={
                <ProtectedRoute requiredUserType="developer">
                  <DeveloperDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/my-applications" 
              element={
                <ProtectedRoute requiredUserType="developer">
                  <MyApplicationsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/developer/tickets/:ticketId" 
              element={
                <ProtectedRoute requiredUserType="developer">
                  <DeveloperTicketDetail />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/onboarding/developer" 
              element={
                <ProtectedRoute requiredUserType="developer">
                  <DeveloperOnboarding />
                </ProtectedRoute>
              } 
            />
            
            {/* Client-specific routes */}
            <Route 
              path="/client-profile" 
              element={
                <ProtectedRoute requiredUserType="client">
                  <ClientProfile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/client-dashboard" 
              element={
                <ProtectedRoute requiredUserType="client">
                  <ClientLanding />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/client" 
              element={
                <ProtectedRoute requiredUserType="client">
                  <ClientLanding />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/client-tickets" 
              element={
                <ProtectedRoute requiredUserType="client">
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/onboarding/client" 
              element={
                <ProtectedRoute requiredUserType="client">
                  <ClientOnboarding />
                </ProtectedRoute>
              } 
            />
            
            {/* Routes accessible by both user types */}
            <Route path="/get-help/*" element={<GetHelpPage />} />
            
            <Route 
              path="/session-history" 
              element={
                <ProtectedRoute>
                  <SessionHistory />
                </ProtectedRoute>
              } 
            />
            
            {/* Role-specific redirects - Fix the TypeScript error by using a proper route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } 
            />
            
            {/* Legacy route redirects */}
            <Route 
              path="/ticket-dashboard" 
              element={<Navigate to="/client-tickets" replace />} 
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </HelpRequestProvider>
    </AuthProvider>
  );
}

// Component to handle redirection based on user type
const DashboardRedirect = () => {
  const { userType } = useAuth();
  
  if (userType === 'developer') {
    return <Navigate to="/developer-dashboard" replace />;
  } else if (userType === 'client') {
    return <Navigate to="/client-dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default App;
