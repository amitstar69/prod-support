
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import GetHelpPage from '../pages/GetHelpPage';
import SessionHistory from '../pages/SessionHistory';
import TicketDetailPage from '../pages/TicketDetailPage';

export const protectedRoutes = [
  <Route 
    key="get-help"
    path="/get-help/*" 
    element={
      <ProtectedRoute>
        <GetHelpPage />
      </ProtectedRoute>
    }
  />,
  <Route 
    key="session-history"
    path="/session-history" 
    element={
      <ProtectedRoute>
        <SessionHistory />
      </ProtectedRoute>
    }
  />,
  <Route 
    key="ticket-detail"
    path="/tickets/:ticketId" 
    element={
      <ProtectedRoute>
        <TicketDetailPage />
      </ProtectedRoute>
    }
  />
];
