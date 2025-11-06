import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <NotificationProvider>
      <AppProvider>
        <App />
        <Toaster />
      </AppProvider>
    </NotificationProvider>
  </AuthProvider>
);
