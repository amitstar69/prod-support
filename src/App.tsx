
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';
import AuthenticationGuard from './components/auth/AuthenticationGuard';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import RegistrationPage from './pages/RegistrationPage';
import HelpRequestForm from './components/help/HelpRequestForm';
import Dashboard from './pages/Dashboard';
import TicketsPage from './pages/TicketsPage';
import ClientDashboard from './pages/ClientDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './contexts/auth';
import { Roles } from './types/roles';
import RoleBasedGuard from './components/auth/RoleBasedGuard';
import HelpRequestHistoryDialog from './components/help/HelpRequestHistoryDialog';
import TicketDetailPage from './pages/TicketDetailPage';
import UnifiedTicketDetailPage from './pages/UnifiedTicketDetailPage';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/logout",
    element: <LogoutPage />,
  },
  {
    path: "/register",
    element: <RegistrationPage />,
  },
  {
    path: "/",
    element: <AuthenticationGuard><Dashboard /></AuthenticationGuard>,
  },
  {
    path: "/tickets",
    element: <AuthenticationGuard><TicketsPage /></AuthenticationGuard>,
  },
  {
    path: "/client/dashboard",
    element: <AuthenticationGuard><RoleBasedGuard roles={[Roles.CLIENT]}><ClientDashboard /></RoleBasedGuard></AuthenticationGuard>,
  },
  {
    path: "/developer/dashboard",
    element: <AuthenticationGuard><RoleBasedGuard roles={[Roles.DEVELOPER]}><DeveloperDashboard /></RoleBasedGuard></AuthenticationGuard>,
  },
  {
    path: "/admin/dashboard",
    element: <AuthenticationGuard><RoleBasedGuard roles={[Roles.ADMIN]}><AdminDashboard /></RoleBasedGuard></AuthenticationGuard>,
  },
  {
    path: "/help",
    element: <AuthenticationGuard><HelpRequestForm /></AuthenticationGuard>,
  },
  {
    path: "/help-request-history",
    element: <AuthenticationGuard>
      <HelpRequestHistoryDialog 
        isOpen={true}
        onClose={() => {}}
        requestId=""
        requestTitle=""
      />
    </AuthenticationGuard>,
  },
  {
    path: "/tickets/:ticketId",
    element: <AuthenticationGuard><TicketDetailPage /></AuthenticationGuard>
  },
  {
    path: "/developer/tickets/:ticketId",
    element: <UnifiedTicketDetailPage />
  },
  {
    path: "/client/tickets/:ticketId",
    element: <UnifiedTicketDetailPage />
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
