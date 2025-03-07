
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import Profile from './pages/Profile';
import ClientProfile from './pages/ClientProfile';
import NotFound from './pages/NotFound';
import DeveloperRegistration from './pages/DeveloperRegistration';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GetHelpPage from './pages/GetHelpPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/developer-registration" element={<DeveloperRegistration />} />
          <Route 
            path="/profile" 
            element={<ProtectedRoute requiredUserType="developer"><Profile /></ProtectedRoute>} 
          />
          <Route 
            path="/client-profile" 
            element={<ProtectedRoute requiredUserType="client"><ClientProfile /></ProtectedRoute>} 
          />
          {/* Help request routes */}
          <Route 
            path="/get-help/*" 
            element={<ProtectedRoute requiredUserType="client"><GetHelpPage /></ProtectedRoute>} 
          />
          <Route 
            path="/session-history" 
            element={<ProtectedRoute requiredUserType="client"><NotFound /></ProtectedRoute>} 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
