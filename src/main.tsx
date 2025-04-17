
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

// Initialize Supabase services
import './integrations/supabase/init';

// Auth and context providers
import { AuthProvider } from './contexts/auth';
import { HelpRequestProvider } from './contexts/HelpRequestContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <HelpRequestProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelpRequestProvider>
    </AuthProvider>
  </React.StrictMode>,
);
