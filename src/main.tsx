
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initEmergencyRecovery } from './utils/emergencyRecovery.ts'

// Initialize emergency recovery mechanism
initEmergencyRecovery();

// Add loading timeout to prevent infinite loading
let appLoaded = false;
setTimeout(() => {
  if (!appLoaded) {
    console.warn('Application took too long to load, forcing initialization');
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Loading is taking longer than expected</h2>
          <p>Click the button below to try again</p>
          <button onclick="window.location.reload()" 
                  style="padding: 8px 16px; background: #0070f3; color: white; 
                         border: none; border-radius: 4px; cursor: pointer;">
            Reload Page
          </button>
          <p style="margin-top: 12px; font-size: 14px;">
            If problems persist, try clearing your browser cache and cookies
          </p>
        </div>
      `;
    }
  }
}, 15000);

// Render the application
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
appLoaded = true;
