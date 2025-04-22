
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DeveloperWelcomePage from '../pages/DeveloperWelcomePage';
import DeveloperDashboard from '../pages/DeveloperDashboard';
import Profile from '../pages/Profile';
import MyApplicationsPage from '../pages/MyApplicationsPage';
import DeveloperOnboarding from '../pages/onboarding/DeveloperOnboarding';
import SessionHistory from '../pages/SessionHistory';

export const developerRoutes = 
  <Route path="/developer/*" element={
    <ProtectedRoute requiredUserType="developer">
      <Routes>
        <Route path="welcome" element={<DeveloperWelcomePage />} />
        <Route path="dashboard" element={<DeveloperDashboard />} />
        <Route path="tickets" element={<DeveloperDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="applications" element={<MyApplicationsPage />} />
        <Route path="onboarding" element={<DeveloperOnboarding />} />
        <Route path="sessions" element={<SessionHistory />} />
        <Route path="tickets/:ticketId" element={<Navigate to="/tickets/:ticketId" replace />} />
      </Routes>
    </ProtectedRoute>
  } />;
