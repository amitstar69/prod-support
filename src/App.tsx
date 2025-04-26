
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Dashboard, LoginPage, RegisterPage, Profile, HelpRequestDetail } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/help-request/:helpRequestId" 
          element={
            <ProtectedRoute>
              <HelpRequestDetail />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
