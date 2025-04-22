
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import ClientLanding from '../pages/ClientLanding';
import ClientDashboard from '../pages/ClientDashboard';
import ApplicationDetailPage from '../pages/ApplicationDetailPage';
import ClientProfile from '../pages/ClientProfile';
import ClientOnboarding from '../pages/onboarding/ClientOnboarding';
import SessionHistory from '../pages/SessionHistory';
import GetHelpPage from '../pages/GetHelpPage';

export const clientRoutes = 
  <Route path="/client/*" element={
    <ProtectedRoute requiredUserType="client">
      <Routes>
        <Route path="landing" element={<ClientLanding />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="tickets" element={<ClientDashboard />} />
        <Route path="applications/:applicationId" element={<ApplicationDetailPage />} />
        <Route path="profile" element={<ClientProfile />} />
        <Route path="onboarding" element={<ClientOnboarding />} />
        <Route path="sessions" element={<SessionHistory />} />
        <Route path="help" element={<GetHelpPage />} />
        <Route path="tickets/:ticketId" element={<Navigate to="/tickets/:ticketId" replace />} />
      </Routes>
    </ProtectedRoute>
  } />;
