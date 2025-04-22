
import { Route, Navigate } from 'react-router-dom';
import { UserTypeRedirect, UserAccountRedirect } from '../components/auth/Redirects';

export const redirectRoutes = [
  <Route key="dashboard" path="/dashboard" element={<UserTypeRedirect />} />,
  <Route key="home" path="/home" element={<UserTypeRedirect />} />,
  <Route key="account" path="/account" element={<UserAccountRedirect />} />,
  <Route key="developer-dashboard" path="/developer-dashboard" element={<Navigate to="/developer/dashboard" replace />} />,
  <Route key="client-dashboard" path="/client-dashboard" element={<Navigate to="/client/dashboard" replace />} />,
  <Route key="ticket-dashboard" path="/ticket-dashboard" element={<Navigate to="/client/tickets" replace />} />,
  <Route key="developer-onboarding" path="/onboarding/developer" element={<Navigate to="/developer/onboarding" replace />} />,
  <Route key="client-onboarding" path="/onboarding/client" element={<Navigate to="/client/onboarding" replace />} />
];
