
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
  // Initialize emergency recovery
  useEffect(() => {
    const cleanup = initEmergencyRecovery();
    
    // Check if user might be stuck in a loading state
    if (isUserStuckInLoadingState()) {
      console.warn('User appears to be stuck in a loading state, attempting recovery');
      logoutUser();
    }
    
    return cleanup;
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
