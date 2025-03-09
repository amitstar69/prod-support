
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import ProductDetail from './pages/ProductDetail';
import GetHelpPage from './pages/GetHelpPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DeveloperDashboard from './pages/DeveloperDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ProfilePage from './pages/Profile';
import DeveloperRegistration from './pages/DeveloperRegistration';
import ClientProfile from './pages/ClientProfile';
import SessionsPage from './pages/SessionsPage';
import HelpSessionInterface from './components/session/HelpSessionInterface';
import SearchPage from './pages/Search';
import NotFound from './pages/NotFound';
import SessionHistory from './pages/SessionHistory';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

// Removed the BrowserRouter as Router import and wrapper since it's already in main.tsx

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/get-help" element={<GetHelpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/developer-register" element={<DeveloperRegistration />} />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/client-profile" element={
          <ProtectedRoute>
            <ClientProfile />
          </ProtectedRoute>
        } />
        
        <Route path="/developer-dashboard" element={<DeveloperDashboard />} />
        
        <Route path="/client-dashboard" element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/sessions" element={
          <ProtectedRoute>
            <SessionsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/sessions/:sessionId" element={
          <ProtectedRoute>
            <HelpSessionInterface />
          </ProtectedRoute>
        } />
        
        <Route path="/session-history" element={
          <ProtectedRoute>
            <SessionHistory />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <SonnerToaster position="top-right" />
    </>
  );
}

export default App;
