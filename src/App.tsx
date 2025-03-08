
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import Index from './pages/Index';
import GetHelpPage from './pages/GetHelpPage';
import SearchPage from './pages/Search';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Profile from './pages/Profile';
import ClientProfile from './pages/ClientProfile';
import ProductDetail from './pages/ProductDetail';
import DeveloperRegistration from './pages/DeveloperRegistration';
import SessionHistory from './pages/SessionHistory';
import DeveloperDashboard from './pages/DeveloperDashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

// Contexts
import { HelpRequestProvider } from './contexts/HelpRequestContext';
import { AuthProvider } from './contexts/auth';

// Recovery utilities
import { initEmergencyRecovery } from './utils/emergencyRecovery';
import { isUserStuckInLoadingState, logoutUser } from './contexts/auth/authUtils';

function App() {
  // Initialize emergency recovery and handle loading state issues
  useEffect(() => {
    console.log('App mounted, initializing systems...');
    
    // Add visual indicator for debugging
    document.body.classList.add('app-loading');
    console.log('Page is loading - added app-loading class');
    
    // Initialize emergency recovery system
    const cleanup = initEmergencyRecovery();
    
    // Check if user might be stuck in a loading state
    if (isUserStuckInLoadingState()) {
      console.warn('User appears to be stuck in a loading state, attempting recovery');
      logoutUser();
      
      // Display message after small delay to ensure it's seen
      setTimeout(() => {
        console.log('Displaying recovery message to user');
      }, 500);
    }
    
    // Set a failsafe to ensure the app doesn't get permanently stuck
    const timeoutId = setTimeout(() => {
      if (document.body.classList.contains('app-loading')) {
        console.warn('App still showing loading state after timeout, forcing reset');
        document.body.classList.remove('app-loading');
        console.log('Removed app-loading class after timeout');
      }
    }, 3000); // Reduced from 10s to 3s for faster feedback
    
    // Remove loading indicator when component is fully mounted
    document.body.classList.remove('app-loading');
    console.log('App fully mounted - removed app-loading class');
    
    return () => {
      cleanup();
      clearTimeout(timeoutId);
      document.body.classList.remove('app-loading');
      console.log('App unmounting, cleanup complete');
    };
  }, []);
  
  return (
    <>
      <AuthProvider>
        <HelpRequestProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/developer-registration" element={<DeveloperRegistration />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/get-help/*" element={<GetHelpPage />} />
            <Route path="/session-history" element={<SessionHistory />} />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requiredUserType="developer">
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/client-profile" 
              element={
                <ProtectedRoute requiredUserType="client">
                  <ClientProfile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/developer-dashboard" 
              element={
                <ProtectedRoute requiredUserType="developer">
                  <DeveloperDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HelpRequestProvider>
      </AuthProvider>
      
      <Toaster />
      <SonnerToaster position="top-right" expand={false} richColors closeButton />
    </>
  );
}

export default App;
