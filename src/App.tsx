
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { ThemeProvider } from './components/ui/theme-provider';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/errors/ErrorBoundary';

// Pages
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientProfile from './pages/ClientProfile';
import ClientDashboard from './pages/ClientDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import GetHelpPage from './pages/GetHelpPage';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import DeveloperRegistration from './pages/DeveloperRegistration';
import DeveloperWelcomePage from './pages/DeveloperWelcomePage';
import ClientLanding from './pages/ClientLanding';
import DeveloperTicketDetail from './pages/DeveloperTicketDetail';
import MyApplicationsPage from './pages/MyApplicationsPage';
import SessionHistory from './pages/SessionHistory';

// Onboarding
import ClientOnboarding from './pages/onboarding/ClientOnboarding';
import DeveloperOnboarding from './pages/onboarding/DeveloperOnboarding';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
              
              {/* Client Routes */}
              <Route path="/client-landing" element={<ClientLanding />} />
              <Route path="/client-profile" element={<ProtectedRoute element={<ClientProfile />} />} />
              <Route path="/client-dashboard" element={<ProtectedRoute element={<ClientDashboard />} />} />
              <Route path="/get-help" element={<GetHelpPage />} />
              <Route path="/get-help/request/:id" element={<ProtectedRoute element={<DeveloperTicketDetail />} />} />
              
              {/* Developer Routes */}
              <Route path="/developer-welcome" element={<DeveloperWelcomePage />} />
              <Route path="/developer-register" element={<DeveloperRegistration />} />
              <Route path="/search" element={<Search />} />
              <Route path="/developer-dashboard" element={<ProtectedRoute element={<DeveloperDashboard />} />} />
              <Route path="/my-applications" element={<ProtectedRoute element={<MyApplicationsPage />} />} />
              <Route path="/sessions-history" element={<ProtectedRoute element={<SessionHistory />} />} />
              
              {/* Onboarding Routes */}
              <Route path="/onboarding/client" element={<ProtectedRoute element={<ClientOnboarding />} />} />
              <Route path="/onboarding/developer" element={<ProtectedRoute element={<DeveloperOnboarding />} />} />
              
              {/* Product Routes */}
              <Route path="/products/:id" element={<ProductDetail />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <SonnerToaster position="top-right" richColors closeButton />
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
