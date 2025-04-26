import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DeveloperDashboard from './pages/DeveloperDashboard';
import ProfilePage from './pages/ProfilePage';
import TicketDetailPage from './pages/TicketDetailPage';
import NewHelp from './pages/NewHelp';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/auth';
import { supabase } from './integrations/supabase/client';
import { toast } from 'sonner';
import DeveloperTicketsPage from './pages/developer/DeveloperTicketsPage';
import ClientTicketsPage from './pages/client/ClientTicketsPage';
import SearchPage from './pages/SearchPage';
import SessionHistoryPage from './pages/SessionHistoryPage';
import MyApplicationsPage from './pages/developer/MyApplicationsPage';

function App() {
  const { isAuthenticated, userId, initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const handleAuthChange = (event: any) => {
      if (event.session) {
        console.log('[App] Supabase session changed:', event);
        toast.success('Authentication state changed');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Client Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredUserType="client">
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/client-tickets" element={
          <ProtectedRoute requiredUserType="client">
            <ClientTicketsPage />
          </ProtectedRoute>
        } />
        
        {/* Developer Routes */}
        <Route path="/developer-dashboard" element={
          <ProtectedRoute requiredUserType="developer">
            <DeveloperDashboard />
          </ProtectedRoute>
        } />
        <Route path="/developer-tickets" element={
          <ProtectedRoute requiredUserType="developer">
            <DeveloperTicketsPage />
          </ProtectedRoute>
        } />
        <Route path="/my-applications" element={
          <ProtectedRoute requiredUserType="developer">
            <MyApplicationsPage />
          </ProtectedRoute>
        } />
        
        {/* Shared Routes - Both client and developer can access */}
        <Route path="/tickets/:ticketId" element={
          <ProtectedRoute allowMultipleTypes={true} allowedUserTypes={["client", "developer"]}>
            <TicketDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/new-help" element={
          <ProtectedRoute requiredUserType="client">
            <NewHelp />
          </ProtectedRoute>
        } />
        
        <Route path="/chat/:ticketId" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />

        {/* Public Routes */}
        <Route path="/search" element={<SearchPage />} />
        <Route path="/session-history" element={<SessionHistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
