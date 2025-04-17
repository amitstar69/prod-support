
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initEmergencyRecovery } from './utils/emergencyRecovery.ts'

// Initialize emergency recovery mechanism
initEmergencyRecovery();

createRoot(document.getElementById("root")!).render(
  <App />
);
