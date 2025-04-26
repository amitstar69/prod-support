import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Navigate
} from 'react-router-dom';
import { useAuth } from './contexts/auth';
import { getUserHomePage, isCorrectUserPath } from './utils/navigationUtils';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ClientDashboard from './pages/ClientDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import SearchPage from './pages/SearchPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DeveloperProfilePage from './pages/DeveloperProfilePage';
import HelpRequestDetailPage from './pages/HelpRequestDetailPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import SessionsHistoryPage from './pages/SessionsHistoryPage';
import ProfilePage from './pages/ProfilePage';
import { ApplicationDetailPage } from './pages';

// ProtectedRoute component
function ProtectedRoute({ children, userType }: { children: React.ReactNode, userType?: string }) {
  const { isAuthenticated, isLoading, loggedInUserType } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && loggedInUserType) {
      if (userType && loggedInUserType !== userType) {
        console.warn('Unauthorized access attempt. Redirecting...');
        // Redirect to the correct dashboard based on user type
        const correctDashboard = getUserHomePage(loggedInUserType);
        window.location.href = correctDashboard; // Full page reload to prevent issues
      }
    }
  }, [isLoading, isAuthenticated, loggedInUserType, userType, location]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a more appropriate loading indicator
  }

  if (!isAuthenticated) {
    // Redirect to login page, preserving the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific user type is required, check if the logged-in user type matches
  if (userType && loggedInUserType !== userType) {
    return <div>Unauthorized</div>; // Or a more appropriate unauthorized message
  }

  return children;
}

// AutoRedirectToDashboard component
function AutoRedirectToDashboard() {
  const { isAuthenticated, isLoading, loggedInUserType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && loggedInUserType) {
        const intendedRoute = location.state?.from?.pathname || getUserHomePage(loggedInUserType);
        if (intendedRoute && isCorrectUserPath(intendedRoute, loggedInUserType)) {
          navigate(intendedRoute, { replace: true });
        } else {
          // Fallback to the user's home page if the intended route is not valid
          navigate(getUserHomePage(loggedInUserType), { replace: true });
        }
      } else {
        // If not authenticated, redirect to login page
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, loggedInUserType, navigate, location]);

  return null; // This component doesn't render anything
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/product/:productId" element={<ProductDetailPage />} />
      <Route path="/developer-profiles/:developerId" element={<DeveloperProfilePage />} />
      
      {/* Client Routes */}
      <Route 
        path="/client" 
        element={
          <ProtectedRoute userType="client">
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/dashboard" 
        element={
          <ProtectedRoute userType="client">
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/tickets" 
        element={
          <ProtectedRoute userType="client">
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/tickets/:ticketId" 
        element={
          <ProtectedRoute userType="client">
            <HelpRequestDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/sessions"
        element={
          <ProtectedRoute userType="client">
            <SessionsHistoryPage />
          </ProtectedRoute>
        }
      />

      {/* Developer Routes */}
      <Route 
        path="/developer" 
        element={
          <ProtectedRoute userType="developer">
            <DeveloperDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/developer/dashboard" 
        element={
          <ProtectedRoute userType="developer">
            <DeveloperDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/developer/sessions"
        element={
          <ProtectedRoute userType="developer">
            <SessionsHistoryPage />
          </ProtectedRoute>
        }
      />
      
      {/* Common Routes - accessible by both client and developer after authentication */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/my-applications" 
        element={
          <ProtectedRoute userType="developer">
            <MyApplicationsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Add the application detail route */}
      <Route 
        path="/client/applications/:applicationId" 
        element={
          <ProtectedRoute userType="client">
            <ApplicationDetailPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
