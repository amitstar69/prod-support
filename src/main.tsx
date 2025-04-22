
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import App from './App.tsx'
import './index.css'
import { initEmergencyRecovery } from './utils/emergencyRecovery.ts'
import { Toaster } from './components/ui/sonner'

// Initialize emergency recovery mechanism
initEmergencyRecovery();

// Add loading timeout to prevent infinite loading
let appLoaded = false;
const loadingTimeout = setTimeout(() => {
  if (!appLoaded) {
    console.warn('Application took too long to load, forcing initialization');
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Loading is taking longer than expected</h2>
          <p>We're having trouble loading the application. Please try one of these options:</p>
          
          <div style="margin: 20px 0; display: flex; flex-direction: column; gap: 10px; max-width: 300px; margin: 0 auto;">
            <button onclick="window.location.reload()" 
                    style="padding: 8px 16px; background: #0070f3; color: white; 
                           border: none; border-radius: 4px; cursor: pointer;">
              Reload Page
            </button>
            
            <button onclick="localStorage.clear(); window.location.reload()" 
                    style="padding: 8px 16px; background: #f30070; color: white; 
                           border: none; border-radius: 4px; cursor: pointer;">
              Clear Cache & Reload
            </button>
            
            <a href="/?force_public=true" 
               style="padding: 8px 16px; background: #333; color: white; 
                      border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block;">
              Emergency Public Mode
            </a>
          </div>
          
          <p style="margin-top: 20px; font-size: 14px;">
            If problems persist, please contact support.
          </p>
        </div>
      `;
    }
  }
}, 20000); // Increased from 12000ms to 20000ms for slower connections

// Render the application
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found!");
    document.body.innerHTML = '<div style="text-align: center; padding: 40px;">Error: Root element not found</div>';
  } else {
    const root = createRoot(rootElement);
    root.render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <App />
        <Toaster position="top-right" />
      </ThemeProvider>
    );
    appLoaded = true;
    clearTimeout(loadingTimeout);
    console.log("Application successfully rendered");
  }
} catch (error) {
  console.error("Fatal error rendering application:", error);
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <h2>Something went wrong</h2>
      <p>The application failed to start. Please try refreshing the page.</p>
      <button onclick="window.location.reload()" 
              style="padding: 8px 16px; margin-top: 20px; background: #0070f3; color: white; 
                     border: none; border-radius: 4px; cursor: pointer;">
        Refresh Page
      </button>
    </div>
  `;
}
