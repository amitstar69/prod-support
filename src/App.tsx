
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import Index from './pages/Index';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import ClientProfile from './pages/ClientProfile';
import GetHelpPage from './pages/GetHelpPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';
import DeveloperDashboard from './pages/DeveloperDashboard';
import ClientDashboard from './pages/ClientDashboard';
import DeveloperRegistration from './pages/DeveloperRegistration';
import SessionHistory from './pages/SessionHistory';
import DeveloperTicketDetail from './pages/DeveloperTicketDetail';

import { AuthProvider } from './contexts/auth';
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
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/developer" element={<DeveloperRegistration />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/client-profile" 
              element={
                <ProtectedRoute>
                  <ClientProfile />
                </ProtectedRoute>
              } 
            />
            <Route path="/get-help" element={<GetHelpPage />} />
            <Route path="/get-help/request/:requestId" element={<GetHelpPage />} />
            <Route 
              path="/client-dashboard" 
              element={
                <ProtectedRoute requiredUserType="client">
                  <ClientDashboard />
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
            
            {/* Route for developer ticket details */}
            <Route 
              path="/developer/tickets/:ticketId" 
              element={
                <ProtectedRoute requiredUserType="developer">
                  <DeveloperTicketDetail />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/session-history" 
              element={
                <ProtectedRoute>
                  <SessionHistory />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </HelpRequestProvider>
    </AuthProvider>
  );
}

export default App;
