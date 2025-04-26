import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import HelpRequestDetail from './pages/HelpRequestDetail';
import { ManageApplications } from './pages/applications/ManageApplications';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route 
          path="/applications/:helpRequestId" 
          element={
            <ProtectedRoute>
              <ManageApplications />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
