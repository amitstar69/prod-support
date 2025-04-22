
import React, { useEffect, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from './contexts/auth';
import { HelpRequestProvider } from './contexts/HelpRequestContext';
import NotFound from './pages/NotFound';

// Import route configurations
import { authRoutes } from './routes/auth.routes';
import { publicRoutes } from './routes/public.routes';
import { protectedRoutes } from './routes/protected.routes';
import { developerRoutes } from './routes/developer.routes';
import { clientRoutes } from './routes/client.routes';
import { redirectRoutes } from './routes/redirect.routes';

// Import components for error and loading states
import { ErrorFallback } from './components/error/ErrorFallback';
import { LoadingFallback } from './components/loading/LoadingFallback';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <AuthProvider>
        <HelpRequestProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                {publicRoutes}
                
                {/* Auth Routes */}
                {authRoutes}
                
                {/* Protected Routes */}
                {protectedRoutes}
                
                {/* Developer Routes */}
                {developerRoutes}
                
                {/* Client Routes */}
                {clientRoutes}
                
                {/* Redirect Routes */}
                {redirectRoutes}
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Suspense>
          </BrowserRouter>
        </HelpRequestProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
