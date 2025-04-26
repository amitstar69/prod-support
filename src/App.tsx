
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Dashboard } from './pages';
import { Login } from './pages';
import { Register } from './pages';
import { Profile } from './pages';
import { HelpRequestDetail } from './pages';
import { ManageApplications } from './pages/applications';

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
