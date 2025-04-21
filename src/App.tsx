import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import Home from './pages/Home';
import ClientDashboard from './pages/ClientDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import { AuthProvider } from './contexts/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import HelpRequestForm from './pages/HelpRequestForm';
import { Toaster } from 'sonner';
import PublicHelpRequests from './pages/PublicHelpRequests';
import TicketDetailPage from './pages/TicketDetailPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/developer-dashboard" element={<DeveloperDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/help-request" element={<HelpRequestForm />} />
            <Route path="/public-requests" element={<PublicHelpRequests />} />
            
            {/* Unified Ticket Detail Page */}
            <Route path="/ticket/:ticketId" element={<TicketDetailPage />} />
            
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
